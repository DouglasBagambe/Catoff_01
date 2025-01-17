// src/social/telegram.ts

import { Telegraf, Context } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { createHash } from "crypto";
import dotenv from "dotenv";
import { GamingChallengeService } from "../solana/gaming_challenge_service";

dotenv.config();

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface ChallengeDetails {
  creator: string;
  wagerAmount: number;
  challengeId: string;
  riotId?: string;
}

interface WinnerDetails {
  winner: string;
  amount: number;
  challengeId: string;
  stats?: {
    kills: number;
    deaths: number;
    assists: number;
  };
}

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export class TelegramService {
  private bot: Telegraf;
  private channelId: string;
  private userStates: Map<number, { command: string; data: any }>;
  private gamingService: GamingChallengeService;
  private botWallet: Keypair;
  handleAcceptChallenge: any;
  handleViewChallenge: any;
  handleHelp: any;

  constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error(
        "TELEGRAM_BOT_TOKEN is not defined in environment variables"
      ) as unknown as {
        status: string;
        creator: PublicKey;
        challenger: PublicKey;
        wagerAmount: any;
        createdAt: number;
      };
    }

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || "";
    this.userStates = new Map();

    // Initialize Solana connection and wallet
    const connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );
    this.botWallet = Keypair.generate(); // In production, load from secure storage
    const wallet = new Wallet(this.botWallet);

    // Initialize gaming service
    this.gamingService = new GamingChallengeService(
      connection,
      wallet,
      new PublicKey("EqRQ5Ab5XnoE5x5nJWiRX4UzDrEt1VDiKiHmev4FsGS9")
    );

    this.setupCommands();
  }

  private setupCommands() {
    this.bot.command("start", this.handleStart.bind(this));
    this.bot.command("search_player", this.handleSearchPlayer.bind(this));
    this.bot.command("get_matches", this.handleGetMatches.bind(this));
    this.bot.command("create_challenge", this.handleCreateChallenge.bind(this));
    this.bot.command("accept_challenge", this.handleAcceptChallenge.bind(this));
    this.bot.command("view_challenge", this.handleViewChallenge.bind(this));
    this.bot.command("help", this.handleHelp.bind(this));

    this.bot.on("text", this.handleTextInput.bind(this));

    this.bot.catch((err: unknown) => {
      console.error("Telegram Bot Error:", err);
    });
  }

  private async handleStart(ctx: Context) {
    const message = `Welcome to Catoff! 🎮

Main Commands:
/search_player - Search for a player
/get_matches - Get player's match history
/create_challenge - Create an on-chain challenge
/accept_challenge - Accept an on-chain challenge
/view_challenge - View challenge details
/help - Show detailed help

Visit catoff.io for more information!`;

    await ctx.reply(message);
  }

  private async handleTextInput(ctx: Context) {
    if (!("text" in ctx.message!) || !ctx.from) return;

    const userId = ctx.from.id;
    const userState = this.userStates.get(userId);

    if (!userState) return;

    switch (userState.command) {
      case "search_player":
        await this.handleSearchPlayerInput(ctx, userId, userState);
        break;
      case "get_matches":
        await this.handleGetMatchesInput(ctx, userId, userState);
        break;
      case "create_challenge":
        await this.handleCreateChallengeInput(ctx, userId, userState);
        break;
      case "accept_challenge":
        await this.handleAcceptChallengeInput(ctx, userId);
        break;
      case "view_challenge":
        await this.handleViewChallengeInput(ctx, userId);
        break;
    }
  }

  private async handleSearchPlayer(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "search_player", data: {} });
    await ctx.reply("Please enter the game name:");
  }

  private async handleSearchPlayerInput(
    ctx: Context,
    userId: number,
    userState: { command: string; data: any }
  ) {
    if (!("text" in ctx.message!)) return;

    if (!userState.data.gameName) {
      userState.data.gameName = ctx.message.text;
      this.userStates.set(userId, userState);
      await ctx.reply("Now please enter the tagline:");
      return;
    }

    const tagLine = ctx.message.text;

    try {
      const response = await fetch(
        `${API_URL}/api/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
          userState.data.gameName
        )}/${encodeURIComponent(tagLine)}`,
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404 ? "Player not found" : "Failed to find player"
        );
      }

      const player: RiotAccount = await response.json();
      await ctx.reply(`
🎮 Player Found!

Name: ${player.gameName}
Tag: ${player.tagLine}
PUUID: ${player.puuid}

Use /get_matches to see recent matches`);
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to search player"
        }`
      );
    }

    this.userStates.delete(userId);
  }

  private async handleGetMatches(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "get_matches", data: {} });
    await ctx.reply("Please enter the PUUID:");
  }

  private async handleGetMatchesInput(
    ctx: Context,
    userId: number,
    userState: { command: string; data: any }
  ) {
    if (!("text" in ctx.message!)) return;

    if (!userState.data.puuid) {
      userState.data.puuid = ctx.message.text;
      this.userStates.set(userId, userState);
      await ctx.reply("Now please enter the region:");
      return;
    }

    const region = ctx.message.text;

    try {
      const matchIdsResponse = await fetch(
        `${API_URL}/api/lol/match/v5/matches/by-puuid/${encodeURIComponent(
          userState.data.puuid
        )}/ids?region=${encodeURIComponent(region)}`
      );

      if (!matchIdsResponse.ok) {
        throw new Error("Failed to fetch match IDs");
      }

      const matchIds = await matchIdsResponse.json();

      const recentMatches = await Promise.all(
        matchIds.slice(0, 5).map(async (matchId: string) => {
          const matchResponse = await fetch(
            `${API_URL}/api/lol/match/v5/matches/${matchId}?region=${encodeURIComponent(
              region
            )}`
          );

          if (!matchResponse.ok) {
            throw new Error(`Failed to fetch match ${matchId}`);
          }

          const matchData = await matchResponse.json();
          const participant = matchData.info.participants.find(
            (p: any) => p.puuid === userState.data.puuid
          );

          return {
            id: matchData.metadata.matchId,
            gameType: matchData.info.gameMode,
            result: participant.win ? "Victory" : "Defeat",
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            date: new Date(matchData.info.gameCreation).toLocaleDateString(),
          };
        })
      );

      const matchesMessage = recentMatches
        .map(
          (match, index) => `
Match ${index + 1}:
🎮 ${match.gameType}
📊 K/D/A: ${match.kills}/${match.deaths}/${match.assists}
🏆 Result: ${match.result}
📅 ${match.date}
        `
        )
        .join("\n");

      await ctx.reply(`Recent Matches:\n${matchesMessage}`);
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to fetch matches"
        }`
      );
    }

    this.userStates.delete(userId);
  }

  private async handleCreateChallenge(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "create_challenge", data: {} });
    await ctx.reply("Please enter the Riot ID (format: username#tagline):");
  }

  private async handleCreateChallengeInput(
    ctx: Context,
    userId: number,
    userState: { command: string; data: any }
  ) {
    if (!("text" in ctx.message!)) return;

    if (!userState.data.riotId) {
      userState.data.riotId = ctx.message.text;
      this.userStates.set(userId, userState);
      await ctx.reply("Now please enter the wager amount in SOL:");
      return;
    }

    const wagerAmount = parseFloat(ctx.message.text);
    const [gameName, tagLine] = userState.data.riotId.split("#");

    try {
      // Generate a stats hash from the Riot ID
      const statsHash = Array.from(
        createHash("sha256").update(userState.data.riotId).digest()
      );

      // Create challenge using the gaming service
      const creatorKeypair = Keypair.generate(); // In production, manage keys securely
      const { challengeAccount, signature } =
        await this.gamingService.createChallenge(
          creatorKeypair,
          wagerAmount,
          statsHash
        );

      const challengeId = challengeAccount.toBase58();

      await this.broadcastChallenge({
        creator: ctx.from?.username || "Anonymous",
        wagerAmount,
        challengeId,
        riotId: userState.data.riotId,
      });

      await ctx.reply(`
🎮 Challenge Created On-Chain!

Challenge ID: ${challengeId}
Creator: ${ctx.from?.username}
LoL Account: ${userState.data.riotId}
Wager: ${wagerAmount} SOL
Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet

Use /accept_challenge to accept this challenge!`);
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to create challenge"
        }`
      );
    }

    this.userStates.delete(userId);
  }
  broadcastChallenge(arg0: {
    creator: string;
    wagerAmount: number;
    challengeId: string;
    riotId: any;
  }) {
    throw new Error("Method not implemented.");
  }

  private async handleAcceptChallengeInput(ctx: Context, userId: number) {
    if (!("text" in ctx.message!)) return;
    const challengeId = ctx.message.text;

    try {
      const challengerKeypair = Keypair.generate(); // In production, manage keys securely

      const signature = await this.gamingService.acceptChallenge(
        challengerKeypair,
        new PublicKey(challengeId)
      );

      await this.announceAcceptance({
        challengeId,
        acceptor: ctx.from?.username || "Anonymous",
        riotId: "pending",
      });

      await ctx.reply(`
🤝 Challenge Accepted On-Chain!

Challenge ID: ${challengeId}
Acceptor: ${ctx.from?.username}
Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet

The match can now begin! Good luck!`);
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to accept challenge"
        }`
      );
    }

    this.userStates.delete(userId);
  }
  announceAcceptance(arg0: {
    challengeId: string;
    acceptor: string;
    riotId: string;
  }) {
    throw new Error("Method not implemented.");
  }

  private async handleViewChallengeInput(ctx: Context, userId: number) {
    if (!("text" in ctx.message!)) return;
    const challengeId = ctx.message.text;

    try {
      const challengeDetails = (await this.gamingService.getChallengeDetails(
        new PublicKey(challengeId)
      )) as unknown as {
        status: string;
        creator: PublicKey;
        challenger: PublicKey;
        wagerAmount: any;
        createdAt: number;
      };

      await ctx.reply(`
🔍 Challenge Details:

Status: ${
        challengeDetails.status === "completed"
          ? "Completed"
          : challengeDetails.status === "active"
          ? "Active"
          : "Inactive"
      }
Creator: ${challengeDetails.creator.toBase58()}
Challenger: ${challengeDetails.challenger.toBase58()}
Wager Amount: ${challengeDetails.wagerAmount.toNumber() / 1e9} SOL
Created At: ${new Date(challengeDetails.createdAt * 1000).toLocaleString()}

View on Solana Explorer: https://explorer.solana.com/address/${challengeId}?cluster=devnet`);
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to view challenge"
        }`
      );
    }

    this.userStates.delete(userId);
  }

  async completeChallenge(
    challengeId: string,
    winner: PublicKey,
    creator: Keypair,
    challenger: Keypair,
    zkProof: number[]
  ) {
    try {
      const signature = await this.gamingService.completeChallenge(
        new PublicKey(challengeId),
        creator,
        challenger,
        winner,
        Buffer.from(zkProof)
      );

      return signature;
    } catch (error) {
      console.error("Error completing challenge:", error);
      throw error;
    }
  }

  start() {
    this.bot.launch();
    console.log("Telegram bot started with Solana integration");

    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }

  stop() {
    this.bot.stop();
  }
}

export default TelegramService;
