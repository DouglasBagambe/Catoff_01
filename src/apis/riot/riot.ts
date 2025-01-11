import axios from "axios";
import dotenv from "dotenv";
import CacheService from "../../services/cache";

dotenv.config();

class RiotAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.RIOT_API_KEY || "";
    this.baseUrl = "https://euw1.api.riotgames.com"; // Europe West server
  }

  // Get Summoner by Name
  async getSummoner(summonerName: string) {
    // Check cache first
    const cacheKey = `summoner:${summonerName}`;
    const cachedData = await CacheService.get(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/lol/summoner/v4/summoners/by-name/${summonerName}`,
        {
          headers: {
            "X-Riot-Token": this.apiKey,
          },
        }
      );

      // Store in cache for 1 hour
      await CacheService.set(cacheKey, response.data, 3600);

      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
    try {
      const response = await axios.get(
        `${this.baseUrl}/lol/summoner/v4/summoners/by-name/${summonerName}`,
        {
          headers: {
            "X-Riot-Token": this.apiKey,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching summoner:", error);
      throw error;
    }
  }

  // Get Match History
  async getMatchHistory(puuid: string, count: number = 10) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`,
        {
          headers: {
            "X-Riot-Token": this.apiKey,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching matches:", error);
      throw error;
    }
  }
}

export default new RiotAPI();
