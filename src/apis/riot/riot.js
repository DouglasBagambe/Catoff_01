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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const cache_1 = __importDefault(require("../../services/cache"));
dotenv_1.default.config();
class RiotAPI {
    constructor() {
        this.apiKey = process.env.RIOT_API_KEY || "";
        this.baseUrl = "https://euw1.api.riotgames.com"; // Europe West server
    }
    // Get Summoner by Name
    getSummoner(summonerName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check cache first
            const cacheKey = `summoner:${summonerName}`;
            const cachedData = yield cache_1.default.get(cacheKey);
            if (cachedData) {
                return cachedData;
            }
            try {
                const response = yield axios_1.default.get(`${this.baseUrl}/lol/summoner/v4/summoners/by-name/${summonerName}`, {
                    headers: {
                        "X-Riot-Token": this.apiKey,
                    },
                });
                // Store in cache for 1 hour
                yield cache_1.default.set(cacheKey, response.data, 3600);
                return response.data;
            }
            catch (error) {
                console.error("Error:", error);
                throw error;
            }
            try {
                const response = yield axios_1.default.get(`${this.baseUrl}/lol/summoner/v4/summoners/by-name/${summonerName}`, {
                    headers: {
                        "X-Riot-Token": this.apiKey,
                    },
                });
                return response.data;
            }
            catch (error) {
                console.error("Error fetching summoner:", error);
                throw error;
            }
        });
    }
    // Get Match History
    getMatchHistory(puuid_1) {
        return __awaiter(this, arguments, void 0, function* (puuid, count = 10) {
            try {
                const response = yield axios_1.default.get(`${this.baseUrl}/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`, {
                    headers: {
                        "X-Riot-Token": this.apiKey,
                    },
                });
                return response.data;
            }
            catch (error) {
                console.error("Error fetching matches:", error);
                throw error;
            }
        });
    }
}
exports.default = new RiotAPI();
