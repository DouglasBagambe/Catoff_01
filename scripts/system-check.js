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
const ws_1 = __importDefault(require("ws"));
const redis_1 = require("redis");
const pg_1 = require("pg");
function checkSystem() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Starting system check...");
        try {
            // Check API
            const apiResponse = yield axios_1.default.get("http://localhost:3000/health");
            console.log("API Status:", apiResponse.status === 200 ? "OK" : "Failed");
            // Check WebSocket
            const ws = new ws_1.default("ws://localhost:3000");
            ws.on("open", () => {
                console.log("WebSocket Status: OK");
                ws.close();
            });
            // Check Redis
            const redis = (0, redis_1.createClient)();
            yield redis.connect();
            yield redis.ping();
            console.log("Redis Status: OK");
            yield redis.quit();
            // Check Database
            const pg = new pg_1.Client();
            yield pg.connect();
            yield pg.query("SELECT NOW()");
            console.log("Database Status: OK");
            yield pg.end();
            console.log("All systems operational!");
        }
        catch (error) {
            console.error("System check failed:", error);
            process.exit(1);
        }
    });
}
checkSystem();
