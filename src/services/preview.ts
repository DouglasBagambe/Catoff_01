import * as puppeteer from "puppeteer";
import CacheService from "./cache";
import { Response } from "express";

interface PreviewData {
  image: string;
  title: string;
  description: string;
}

interface MatchData {
  id: string;
  game: string;
  player1: string;
  player2: string;
  stakes: string;
}

interface ChallengeData {
  id: string;
  gameType: string;
  wagerAmount: string;
  createdAt: Date;
}

class PreviewService {
  private browser: puppeteer.Browser | null = null;
  private cacheService: CacheService;

  constructor() {
    this.cacheService = CacheService.getInstance();
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
    });
  }

  private generateMetaTags(data: MatchData | ChallengeData): string {
    if ("gameType" in data) {
      // Challenge data
      return `
        <meta property="og:title" content="${data.gameType} Challenge" />
        <meta property="og:description" content="Wager Amount: ${data.wagerAmount}" />
        <meta property="og:image" content="https://your-domain.com/preview/${data.id}.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="discord:preview" content="true" />
      `;
    } else {
      // Match data
      return `
        <meta property="og:title" content="${data.game} Match: ${data.player1} vs ${data.player2}" />
        <meta property="og:description" content="Stakes: ${data.stakes}" />
        <meta property="og:image" content="https://your-domain.com/preview/${data.id}.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="discord:preview" content="true" />
      `;
    }
  }

  private generateHTML(data: MatchData | ChallengeData): string {
    const metaTags = this.generateMetaTags(data);

    if ("gameType" in data) {
      // Challenge preview
      return `
        <!DOCTYPE html>
        <html>
          <head>
            ${metaTags}
            <style>
              body { 
                font-family: Arial, sans-serif;
                background: #1a1a1a;
                color: white;
              }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .challenge-card { 
                border: 1px solid #333;
                padding: 20px;
                border-radius: 8px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="challenge-card">
                <h1>${data.gameType} Challenge</h1>
                <p>Wager Amount: ${data.wagerAmount}</p>
                <p>Created: ${data.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else {
      // Match preview
      return `
        <!DOCTYPE html>
        <html>
          <head>
            ${metaTags}
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background: #1a1a1a;
                color: white;
              }
              .match-card {
                border: 1px solid #333;
                border-radius: 8px;
                padding: 15px;
                max-width: 500px;
              }
              .players {
                display: flex;
                justify-content: space-between;
                margin: 15px 0;
              }
              .vs {
                font-size: 24px;
                font-weight: bold;
                color: #ff4444;
              }
            </style>
          </head>
          <body>
            <div class="match-card">
              <h2>${data.game} Match</h2>
              <div class="players">
                <div>${data.player1}</div>
                <div class="vs">VS</div>
                <div>${data.player2}</div>
              </div>
              <div>Stakes: ${data.stakes}</div>
            </div>
          </body>
        </html>
      `;
    }
  }

  async generatePreview(data: MatchData | ChallengeData): Promise<PreviewData> {
    const cacheKey = `preview:${data.id}`;
    const cached = await this.cacheService.get(cacheKey);

    if (cached !== null) {
      return cached as PreviewData;
    }

    if (!this.browser) {
      throw new Error("Browser not initialized");
    }

    const page = await this.browser.newPage();
    const html = this.generateHTML(data);
    await page.setContent(html);

    const selector = "gameType" in data ? ".challenge-card" : ".match-card";
    const element = await page.$(selector);

    if (!element) {
      throw new Error(`Failed to find ${selector} element`);
    }

    const screenshot = await element.screenshot({
      encoding: "base64",
    });

    await page.close();

    const preview: PreviewData = {
      image: `data:image/png;base64,${screenshot}`,
      title:
        "gameType" in data
          ? `${data.gameType} Challenge`
          : `${data.game} Match: ${data.player1} vs ${data.player2}`,
      description:
        "gameType" in data
          ? `Wager Amount: ${data.wagerAmount}`
          : `Stakes: ${data.stakes}`,
    };

    // Cache preview for 1 hour
    await this.cacheService.set(cacheKey, preview, 3600);

    return preview;
  }

  async handlePreviewRequest(id: string, res: Response): Promise<void> {
    try {
      // Try to get either match or challenge data from cache
      const data =
        (await this.cacheService.get(`challenge:${id}`)) ||
        (await this.cacheService.get(`match:${id}`));

      if (data === null) {
        res.status(404).send("Preview not found");
        return;
      }

      const preview = await this.generatePreview(
        data as MatchData | ChallengeData
      );
      res.send(this.generateHTML(data as MatchData | ChallengeData));
    } catch (error) {
      console.error("Error generating preview:", error);
      res.status(500).send("Error generating preview");
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export default new PreviewService();
