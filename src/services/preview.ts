import puppeteer from "puppeteer";
import CacheServiceInstance from "./cache";

class PuppeteerPreviewService {
  private browser: any;

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
    });
  }

  async generatePreview(matchData: any) {
    const cacheKey = `preview:${matchData.id}`;
    const cached = await CacheServiceInstance.get(cacheKey);

    if (cached) {
      return cached;
    }

    const page = await this.browser.newPage();

    // Generate HTML for preview
    const html = `
            <!DOCTYPE html>
            <html>
            <head>
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
                    <h2>${matchData.game} Match</h2>
                    <div class="players">
                        <div>${matchData.player1}</div>
                        <div class="vs">VS</div>
                        <div>${matchData.player2}</div>
                    </div>
                    <div>Stakes: ${matchData.stakes}</div>
                </div>
            </body>
            </html>
        `;

    await page.setContent(html);

    // Generate preview image
    const element = await page.$(".match-card");
    const screenshot = await element?.screenshot({
      encoding: "base64",
    });

    await page.close();

    const preview = {
      image: `data:image/png;base64,${screenshot}`,
      title: `${matchData.game} Match: ${matchData.player1} vs ${matchData.player2}`,
      description: `Stakes: ${matchData.stakes}`,
    };

    // Cache preview for 1 hour
    await CacheServiceInstance.set(cacheKey, preview, 3600);

    return preview;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export default new PuppeteerPreviewService();

import { Response } from "express";
import CacheService from "./cache";

interface ChallengeData {
  id: string;
  gameType: string;
  wagerAmount: string;
  createdAt: Date;
}

export class PreviewService {
  private cache: typeof CacheService;

  constructor() {
    this.cache = CacheService.getInstance();
  }

  generateMetaTags(challenge: ChallengeData): string {
    return `
            <meta property="og:title" content="${challenge.gameType} Challenge" />
            <meta property="og:description" content="Wager Amount: ${challenge.wagerAmount}" />
            <meta property="og:image" content="https://your-domain.com/preview/${challenge.id}.png" />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="discord:preview" content="true" />
        `;
  }

  generatePreviewHTML(challenge: ChallengeData): string {
    return `
            <!DOCTYPE html>
            <html>
                <head>
                    ${this.generateMetaTags(challenge)}
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .challenge-card { border: 1px solid #eee; padding: 20px; border-radius: 8px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="challenge-card">
                            <h1>${challenge.gameType} Challenge</h1>
                            <p>Wager Amount: ${challenge.wagerAmount}</p>
                            <p>Created: ${challenge.createdAt.toLocaleDateString()}</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
  }

  async handlePreviewRequest(challengeId: string, res: Response) {
    try {
      const challenge = await this.cache.get(`challenge:${challengeId}`);
      if (!challenge) {
        res.status(404).send("Challenge not found");
        return;
      }

      const html = this.generatePreviewHTML(challenge);
      res.send(html);
    } catch (error) {
      console.error("Error generating preview:", error);
      res.status(500).send("Error generating preview");
    }
  }
}
