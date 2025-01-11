"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const cache_1 = __importDefault(require("./cache"));
class PreviewService {
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.browser = yield puppeteer_1.default.launch({
                headless: true,
            });
        });
    }
    generatePreview(matchData) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `preview:${matchData.id}`;
            const cached = yield cache_1.default.get(cacheKey);
            if (cached) {
                return cached;
            }
            const page = yield this.browser.newPage();
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
            yield page.setContent(html);
            // Generate preview image
            const element = yield page.$(".match-card");
            const screenshot = yield (element === null || element === void 0 ? void 0 : element.screenshot({
                encoding: "base64",
            }));
            yield page.close();
            const preview = {
                image: `data:image/png;base64,${screenshot}`,
                title: `${matchData.game} Match: ${matchData.player1} vs ${matchData.player2}`,
                description: `Stakes: ${matchData.stakes}`,
            };
            // Cache preview for 1 hour
            yield cache_1.default.set(cacheKey, preview, 3600);
            return preview;
        });
    }
    cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.browser) {
                yield this.browser.close();
            }
        });
    }
}
exports.default = new PreviewService();
