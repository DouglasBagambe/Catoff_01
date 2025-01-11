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
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
class CacheService {
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: "redis://localhost:6379",
        });
        this.client.on("error", (err) => {
            console.error("Redis Error:", err);
        });
        this.client.connect();
    }
    // Store data in cache
    set(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, expirationInSeconds = 3600) {
            try {
                yield this.client.set(key, JSON.stringify(value), {
                    EX: expirationInSeconds,
                });
            }
            catch (error) {
                console.error("Cache set error:", error);
            }
        });
    }
    // Get data from cache
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this.client.get(key);
                return data ? JSON.parse(data) : null;
            }
            catch (error) {
                console.error("Cache get error:", error);
                return null;
            }
        });
    }
    // Delete from cache
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client.del(key);
            }
            catch (error) {
                console.error("Cache delete error:", error);
            }
        });
    }
}
exports.default = new CacheService();
