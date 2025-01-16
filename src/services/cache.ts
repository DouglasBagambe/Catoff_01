// src/services/cache.ts

interface CacheItem<T> {
  value: T;
  expiry?: number;
}

export class CacheService {
  private static instance: CacheService | null = null;
  private cache: Map<string, CacheItem<any>>;

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public async set<T>(
    key: string,
    value: T,
    expirationInSeconds: number = 3600
  ): Promise<void> {
    const expiry =
      expirationInSeconds > 0
        ? Date.now() + expirationInSeconds * 1000
        : undefined;
    this.cache.set(key, { value, expiry });
  }

  public async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  public async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public isReady(): boolean {
    return true;
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && item.expiry < now) {
        this.cache.delete(key);
      }
    }
  }
}

// Create and export a default instance
const cacheService = CacheService.getInstance();
export default cacheService;
