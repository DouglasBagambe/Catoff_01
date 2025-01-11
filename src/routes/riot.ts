import express from "express";
import RiotAPI from "../apis/riot/riot";

const router = express.Router();

// Get summoner info
router.get("/summoner/:name", async (req, res) => {
  try {
    const summoner = await RiotAPI.getSummoner(req.params.name);
    res.json(summoner);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch summoner" });
  }
});

// Get match history
router.get("/matches/:puuid", async (req, res) => {
  try {
    const matches = await RiotAPI.getMatchHistory(req.params.puuid);
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

export default router;
