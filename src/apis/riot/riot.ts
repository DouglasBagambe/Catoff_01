// src/apis/riot/riot.ts
import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import CacheService from "../../services/cache";

dotenv.config();

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface RiotSummoner {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

class RiotAPI {
  private static readonly RIOT_API_KEY = process.env.RIOT_API_KEY;
  private static readonly REGION_BASE_URL = "https://europe.api.riotgames.com";
  private static readonly LOL_BASE_URL = "https://euw1.api.riotgames.com";

  private static async makeRequest<T>(url: string): Promise<T> {
    try {
      const response = await axios.get<T>(url, {
        headers: {
          "X-Riot-Token": this.RIOT_API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(
          `Riot API Error: ${error.response.status} - ${error.response.statusText}`
        );
      }
      throw new Error(
        `Failed to fetch data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async getSummoner(gameName: string, tagLine: string) {
    const cacheKey = `summoner:${gameName}#${tagLine}`;

    try {
      // Check cache first
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // First get Riot Account info
      const accountUrl = `${this.REGION_BASE_URL}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
      const account = await this.makeRequest<RiotAccount>(accountUrl);

      // Then get League-specific summoner data using PUUID
      const summonerUrl = `${this.LOL_BASE_URL}/lol/summoner/v4/summoners/by-puuid/${account.puuid}`;
      const summoner = await this.makeRequest<RiotSummoner>(summonerUrl);

      // Combine the data
      const combinedData = {
        ...summoner,
        tagLine,
        gameName: account.gameName,
      };

      // Cache for 1 hour
      await CacheService.set(cacheKey, combinedData, 3600);
      return combinedData;
    } catch (error) {
      const customError = new Error(
        `Failed to fetch summoner: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.error("Error:", customError);
      throw customError;
    }
  }

  static async getMatchHistory(puuid: string, count: number = 10) {
    const cacheKey = `matches:${puuid}:${count}`;

    try {
      // Check cache first
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const matchesUrl = `${this.REGION_BASE_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
      const matches = await this.makeRequest<string[]>(matchesUrl);

      // Cache for 5 minutes (matches change frequently)
      await CacheService.set(cacheKey, matches, 300);
      return matches;
    } catch (error) {
      const customError = new Error(
        `Failed to fetch matches: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.error("Error fetching matches:", customError);
      throw customError;
    }
  }

  static async getMatchDetails(matchId: string) {
    const cacheKey = `match:${matchId}`;

    try {
      // Check cache first
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const matchUrl = `${this.REGION_BASE_URL}/lol/match/v5/matches/${matchId}`;
      const matchData = await this.makeRequest(matchUrl);

      // Cache for 1 hour (match details don't change)
      await CacheService.set(cacheKey, matchData, 3600);
      return matchData;
    } catch (error) {
      const customError = new Error(
        `Failed to fetch match details: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.error("Error fetching match details:", customError);
      throw customError;
    }
  }
}

export default RiotAPI;
