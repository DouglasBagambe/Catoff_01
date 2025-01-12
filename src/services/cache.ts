import { createClient } from "redis";

class CacheService {
  [x: string]: any;
  private client;

  constructor() {
    this.client = createClient({
      url: "redis://localhost:6379",
    });

    this.client.on("error", (err) => {
      console.error("Redis Error:", err);
    });

    this.client.connect();
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

export default new CacheService();
