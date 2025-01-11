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
const express_1 = __importDefault(require("express"));
const riot_1 = __importDefault(require("../apis/riot/riot"));
const router = express_1.default.Router();
// Get summoner info
router.get("/summoner/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summoner = yield riot_1.default.getSummoner(req.params.name);
        res.json(summoner);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch summoner" });
    }
}));
// Get match history
router.get("/matches/:puuid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matches = yield riot_1.default.getMatchHistory(req.params.puuid);
        res.json(matches);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch matches" });
    }
}));
exports.default = router;
