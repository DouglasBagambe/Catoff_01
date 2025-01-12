// src/routes/riot.ts
import express from "express";
import RiotAPI from "../apis/riot/riot";

const router = express.Router();

// Get summoner info by Riot ID (gameName and tagLine)
router.get("/summoner/:gameName/:tagLine", async (req, res) => {
  try {
    const { gameName, tagLine } = req.params;
    const summoner = await RiotAPI.getSummoner(gameName, tagLine);
    res.json(summoner);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch summoner",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get match history by PUUID
router.get("/matches/:puuid", async (req, res) => {
  try {
    const count = req.query.count ? parseInt(req.query.count as string) : 10;
    const matches = await RiotAPI.getMatchHistory(req.params.puuid, count);
    res.json(matches);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch matches",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get match details
router.get("/match/:matchId", async (req, res) => {
  try {
    const matchData = await RiotAPI.getMatchDetails(req.params.matchId);
    res.json(matchData);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch match details",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
