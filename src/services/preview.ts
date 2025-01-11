import puppeteer from "puppeteer";
import CacheService from "./cache";

class PreviewService {
  private browser: any;

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
    });
  }

  async generatePreview(matchData: any) {
    const cacheKey = `preview:${matchData.id}`;
    const cached = await CacheService.get(cacheKey);

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
    await CacheService.set(cacheKey, preview, 3600);

    return preview;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export default new PreviewService();
