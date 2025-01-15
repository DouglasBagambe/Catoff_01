// src/services/cache.ts
import { createClient } from "redis";

class CacheService {
  private static instance: CacheService | null = null;
  private client;

  private constructor() {
    this.client = createClient({
      url: "redis://localhost:6379",
    });

    this.client.on("error", (err) => {
      console.error("Redis Error:", err);
    });

    this.client.connect().catch((err) => {
      console.error("Failed to connect to Redis:", err);
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public async set(
    key: string,
    value: any,
    expirationInSeconds: number = 3600
  ): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), {
        EX: expirationInSeconds,
      });
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }
}

export default CacheService;
