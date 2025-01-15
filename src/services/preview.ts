// src/services/preview.ts

import CacheService from "./cache";

class PreviewService {
  private static instance: PreviewService | null = null;
  private cacheService: CacheService;

  private constructor() {
    this.cacheService = CacheService.getInstance();
  }

  public static getInstance(): PreviewService {
    if (!PreviewService.instance) {
      PreviewService.instance = new PreviewService();
    }
    return PreviewService.instance;
  }

  public async initialize(): Promise<void> {
    // Add initialization logic here if needed
  }

  public async cleanup(): Promise<void> {
    // Add cleanup logic here if needed
  }

  public async generatePreview(data: any): Promise<void> {
    try {
      await this.cacheService.set(`preview:${data.id}`, data);
    } catch (error) {
      console.error("Error generating preview:", error);
      throw error;
    }
  }

  public async getPreviewData(
    cacheKey: string,
    fetchDataFn: () => Promise<any>
  ): Promise<any> {
    try {
      const cachedData = await this.cacheService.get<any>(cacheKey);
      if (cachedData) {
        console.log("Cache hit:", cacheKey);
        return cachedData;
      }

      console.log("Cache miss:", cacheKey);
      const data = await fetchDataFn();
      await this.cacheService.set(cacheKey, data, 3600);
      return data;
    } catch (error) {
      console.error("Error in getPreviewData:", error);
      throw error;
    }
  }
}

export default PreviewService.getInstance();
