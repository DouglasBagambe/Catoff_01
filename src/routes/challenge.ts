import { Router } from "express";
import { BlockchainService } from "../services/blockchain";
import CacheService from "../services/cache";
import { PreviewService } from "../services/preview";

const router = Router();
const blockchainService = BlockchainService.getInstance();
const cacheService = CacheService.getInstance();
const previewService = new PreviewService();

router.post("/create", async (req, res) => {
  try {
    const { stats, wagerAmount, signer } = req.body;

    const result = await blockchainService.createChallenge(
      stats,
      wagerAmount,
      signer
    );

    // Cache challenge data for preview
    await cacheService.set(`challenge:${result.challengeId}`, {
      ...stats,
      wagerAmount,
      createdAt: new Date(),
    });

    res.json({
      challengeId: result.challengeId,
      transactionHash: result.transactionHash,
      previewUrl: `/preview/challenge/${result.challengeId}`,
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({ error: "Failed to create challenge" });
  }
});

router.post("/accept/:challengeId", async (req, res) => {
  try {
    const { wagerAmount, signer } = req.body;
    const { challengeId } = req.params;

    const result = await blockchainService.acceptChallenge(
      challengeId,
      wagerAmount,
      signer
    );

    res.json({
      success: true,
      transactionHash: result.transactionHash,
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

    res.json({
      success: true,
      transactionHash: result.transactionHash,
    });
  } catch (error) {
    console.error("Error completing challenge:", error);
    res.status(500).json({ error: "Failed to complete challenge" });
  }
});

export default router;
