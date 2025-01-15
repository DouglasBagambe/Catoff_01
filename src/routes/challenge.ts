// src/routes/challenge.ts
import { Router } from "express";
import { BlockchainService } from "../services/blockchain";
import CacheService from "../services/cache";
import previewService from "../services/preview"; // Changed to import singleton instance
import { telegramService, twitterService } from "../app";

const router = Router();
const blockchainService = BlockchainService.getInstance();
const cacheService = CacheService.getInstance();

// Initialize preview service
(async () => {
  try {
    await previewService.initialize();
  } catch (error) {
    console.error("Failed to initialize preview service:", error);
  }
})();

router.post("/create", async (req, res) => {
  try {
    const { stats, wagerAmount, signer, creator, riotId } = req.body;

    const result = await blockchainService.createChallenge(
      stats,
      wagerAmount,
      signer
    );

    // Cache challenge data for preview
    const challengeData = {
      id: result.challengeId, // Added id field for preview service
      gameType: stats.gameType,
      wagerAmount,
      createdAt: new Date(),
      creator,
      riotId,
      ...stats,
    };

    await cacheService.set(`challenge:${result.challengeId}`, challengeData);

    // Generate preview immediately after creation
    try {
      await previewService.generatePreview(challengeData);
    } catch (previewError) {
      console.error("Preview generation failed:", previewError);
    }

    // Broadcast to social media platforms
    try {
      await Promise.all([
        telegramService.broadcastChallenge({
          creator,
          wagerAmount,
          challengeId: result.challengeId,
        }),
        twitterService.postChallenge({
          creator,
          wagerAmount,
          challengeId: result.challengeId,
        }),
      ]);
    } catch (socialError) {
      console.error("Social media broadcast failed:", socialError);
    }

    res.json({
      challengeId: result.challengeId,
      transactionHash: result.transactionHash,
      previewUrl: `/preview/challenge/${result.challengeId}`,
      socialBroadcast: true,
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({ error: "Failed to create challenge" });
  }
});

router.post("/accept/:challengeId", async (req, res) => {
  try {
    const { wagerAmount, signer, acceptor, riotId } = req.body;
    const { challengeId } = req.params;

    const result = await blockchainService.acceptChallenge(
      challengeId,
      wagerAmount,
      signer
    );

    // Update cache with acceptor information
    const challengeData = await cacheService.get(`challenge:${challengeId}`);
    if (challengeData) {
      const updatedData = {
        ...challengeData,
        acceptor,
        acceptorRiotId: riotId,
        acceptedAt: new Date(),
      };
      await cacheService.set(`challenge:${challengeId}`, updatedData);

      // Update preview with new data
      try {
        await previewService.generatePreview(updatedData);
      } catch (previewError) {
        console.error("Preview update failed:", previewError);
      }
    }

    // Notify on social media
    try {
      await Promise.all([
        telegramService.announceAcceptance({
          challengeId,
          acceptor,
          riotId,
        }),
        twitterService.replyToTweet(
          challengeId,
          `🎮 Challenge accepted by ${acceptor}! Game starting soon...`
        ),
      ]);
    } catch (socialError) {
      console.error("Social media notification failed:", socialError);
    }

    res.json({
      success: true,
      transactionHash: result.transactionHash,
      socialNotification: true,
    });
  } catch (error) {
    console.error("Error accepting challenge:", error);
    res.status(500).json({ error: "Failed to accept challenge" });
  }
});

router.post("/complete/:challengeId", async (req, res) => {
  try {
    const { winner, stats, signer } = req.body;
    const { challengeId } = req.params;

    const result = await blockchainService.completeChallenge(
      challengeId,
      winner,
      stats,
      signer
    );

    // Get challenge data from cache for winner announcement
    const challengeData = await cacheService.get(`challenge:${challengeId}`);
    if (challengeData) {
      const winnerDetails = {
        winner:
          winner === challengeData.creator
            ? challengeData.creator
            : challengeData.acceptor,
        amount: challengeData.wagerAmount * 2, // Total pool
        challengeId,
      };

      // Update challenge data with completion info
      const updatedData = {
        ...challengeData,
        completed: true,
        winner: winnerDetails.winner,
        completedAt: new Date(),
      };
      await cacheService.set(`challenge:${challengeId}`, updatedData);

      // Update preview with completion status
      try {
        await previewService.generatePreview(updatedData);
      } catch (previewError) {
        console.error("Preview update failed:", previewError);
      }

      // Announce winner on social media
      try {
        await Promise.all([
          telegramService.announceWinner(winnerDetails),
          twitterService.announceWinner(winnerDetails),
        ]);
      } catch (socialError) {
        console.error("Social media winner announcement failed:", socialError);
      }
    }

    res.json({
      success: true,
      transactionHash: result.transactionHash,
      socialAnnouncement: true,
    });
  } catch (error) {
    console.error("Error completing challenge:", error);
    res.status(500).json({ error: "Failed to complete challenge" });
  }
});

router.get("/:challengeId/social", async (req, res) => {
  try {
    const { challengeId } = req.params;

    // Get challenge tweets
    const tweets = await twitterService.getChallengeTweets();
    const relevantTweets = tweets?.tweets?.filter((tweet) =>
      tweet.text.includes(challengeId)
    );

    res.json({
      success: true,
      socialActivity: {
        twitter: relevantTweets || [],
        telegramUpdates:
          (await cacheService.get(`telegram:${challengeId}`)) || [],
      },
    });
  } catch (error) {
    console.error("Error fetching social activity:", error);
    res.status(500).json({ error: "Failed to fetch social activity" });
  }
});

// Cleanup preview service on app shutdown
process.on("SIGTERM", async () => {
  await previewService.cleanup();
});

export default router;
