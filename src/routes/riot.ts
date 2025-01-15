// src/routes/riot.ts
import express from "express";
import { z } from "zod";
import RiotAPI from "../apis/riot/riot";
import { riotRateLimiter } from "../middleware/rateLimiter";
import { APIError } from "../utils/errors";

const router = express.Router();

// Apply rate limiting to all routes
router.use(riotRateLimiter);

// Input validation schemas
const summonerSchema = z.object({
  gameName: z.string().min(3).max(16),
  tagLine: z.string().min(2).max(5),
});

const matchesSchema = z.object({
  puuid: z.string(),
  count: z.string().transform(Number).optional(),
  startTime: z.string().transform(Number).optional(),
  endTime: z.string().transform(Number).optional(),
  queue: z.string().transform(Number).optional(),
});

const matchSchema = z.object({
  matchId: z.string(),
});

// Validation middleware
const validate =
  (schema: z.ZodSchema) =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const data = {
        ...req.params,
        ...req.query,
      };
      await schema.parseAsync(data);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(
          new APIError(400, "Invalid input", "VALIDATION_ERROR", error.errors)
        );
      } else {
        next(error);
      }
    }
  };

// Routes
router.get(
  "/summoner/:gameName/:tagLine",
  validate(summonerSchema),
  async (req, res, next) => {
    try {
      const { gameName, tagLine } = req.params;
      const summoner = await RiotAPI.getSummoner(gameName, tagLine);
      res.json(summoner);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/matches/:puuid",
  validate(matchesSchema),
  async (req, res, next) => {
    try {
      const { puuid } = req.params;
      const { count, startTime, endTime, queue } = req.query;
      const matches = await RiotAPI.getMatchHistory(
        puuid,
        count ? parseInt(count as string) : undefined,
        startTime ? parseInt(startTime as string) : undefined,
        endTime ? parseInt(endTime as string) : undefined,
        queue ? parseInt(queue as string) : undefined
      );
      res.json(matches);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/match/:matchId", validate(matchSchema), async (req, res, next) => {
  try {
    const matchData = await RiotAPI.getMatchDetails(req.params.matchId);
    res.json(matchData);
  } catch (error) {
    next(error);
  }
});

// Cache management routes (optional, protected by API key)
router.delete(
  "/cache/summoner/:gameName/:tagLine",
  validate(summonerSchema),
  async (req, res, next) => {
    try {
      const apiKey = req.headers["x-api-key"];
      if (apiKey !== process.env.ADMIN_API_KEY) {
        throw new APIError(401, "Unauthorized");
      }

      const { gameName, tagLine } = req.params;
      await RiotAPI.clearSummonerCache(gameName, tagLine);
      res.json({ message: "Cache cleared successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
