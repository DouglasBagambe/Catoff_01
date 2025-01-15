import { Router, Request, Response, RequestHandler } from "express";
import { ParsedQs } from "qs";
import { BlockchainService } from "../services/blockchain";
import CacheService from "../services/cache";
import previewService from "../services/preview";
import { telegramService, twitterService } from "../app";
import { ethers } from "ethers";

interface ChallengeData {
  id: string;
  gameType: string;
  wagerAmount: number;
  createdAt: Date;
  creator: string;
  riotId: string;
  acceptor?: string;
  acceptorRiotId?: string;
  acceptedAt?: Date;
  completed?: boolean;
  winner?: string;
  completedAt?: Date;
  stats: any;
}

interface WinnerDetails {
  winner: string;
  amount: number;
  challengeId: string;
}

interface BroadcastChallengeParams {
  creator: string;
  wagerAmount: number;
  challengeId: string;
}

interface AcceptanceChallengeParams {
  challengeId: string;
  acceptor: string;
  riotId: string;
}

interface TweetReplyParams {
  challengeId: string;
  message: string;
}

interface CreateChallengeRequest {
  stats: any;
  wagerAmount: number;
  signer: string;
  creator: string;
  riotId: string;
}

interface AcceptChallengeRequest {
  wagerAmount: number;
  signer: string;
  acceptor: string;
  riotId: string;
}

interface CompleteChallengeRequest {
  winner: string;
  stats: any;
  signer: string;
}

const router = Router();
const blockchainService = BlockchainService.getInstance();
const cacheService = CacheService.getInstance();

const createChallenge: RequestHandler<{}, any, CreateChallengeRequest> = async (
  req,
  res
): Promise<void> => {
  try {
    const { stats, wagerAmount, creator, riotId } = req.body;
    const signer: ethers.Signer = await blockchainService.getSigner(
      req.body.signer
    );

    if (!stats || !wagerAmount || !signer || !creator || !riotId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const result = await blockchainService.createChallenge(
      stats,
      wagerAmount.toString(),
      signer
    );

    // Rest of your implementation...
    res.json({
      /* your response */
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({
      error: "Failed to create challenge",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const acceptChallenge: RequestHandler<
  { challengeId: string },
  any,
  AcceptChallengeRequest
> = async (req, res) => {
  try {
    const { wagerAmount, signer, acceptor, riotId } = req.body;
    const { challengeId } = req.params;

    // Rest of your implementation...
    res.json({
      /* your response */
    });
  } catch (error) {
    console.error("Error accepting challenge:", error);
    res.status(500).json({
      error: "Failed to accept challenge",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const completeChallenge: RequestHandler<
  { challengeId: string },
  any,
  CompleteChallengeRequest
> = async (req, res) => {
  try {
    const { winner, stats, signer } = req.body;
    const { challengeId } = req.params;

    // Rest of your implementation...
    res.json({
      /* your response */
    });
  } catch (error) {
    console.error("Error completing challenge:", error);
    res.status(500).json({
      error: "Failed to complete challenge",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

router.post("/create", createChallenge);
router.post("/accept/:challengeId", acceptChallenge);
router.post("/complete/:challengeId", completeChallenge);

export default router;
