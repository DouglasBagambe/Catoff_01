// src/services/cache.ts
import { createClient } from "redis";

class CacheService {
  static get(cacheKey: string) {
    throw new Error("Method not implemented.");
  }
  // static set(cacheKey: string, combinedData: { tagLine: string; gameName: string; id: string; accountId: string; puuid: string; name: string; profileIconId: number; revisionDate: number; summonerLevel: number; }, arg2: number) {
  //   throw new Error("Method not implemented.");
  // }
  static set(
    cacheKey: string,
    data:
      | {
          tagLine: string;
          gameName: string;
          id: string;
          accountId: string;
          puuid: string;
          name: string;
          profileIconId: number;
          revisionDate: number;
          summonerLevel: number;
        }
      | string[],
    arg2: number
  ) {
    throw new Error("Method not implemented.");
  }
  private static instance: CacheService | null = null;
  private client;

  private constructor() {
    this.client = createClient({
      url: "redis://localhost:6379",
    });

    this.client.on("error", (err) => {
      console.error("Redis Error:", err);
    });

    this.client.connect();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Store data in cache
  async set(key: string, value: any, expirationInSeconds: number = 3600) {
    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: expirationInSeconds,
      });
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  // Get data from cache
  async get(key: string) {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  // Delete from cache
  async delete(key: string) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }
}

export default CacheService;
