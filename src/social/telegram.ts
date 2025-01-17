import { Telegraf, Context } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import dotenv from "dotenv";

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

interface Match {
  id: string;
  timestamp: number;
  gameType: string;
  result: "win" | "loss";
  kills: number;
  deaths: number;
  assists: number;
}

class TelegramService {
  public bot: Telegraf;
  private channelId: string;
  private userStates: Map<number, { command: string; data: any }>;

  constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error(
        "TELEGRAM_BOT_TOKEN is not defined in environment variables"
      );
    }

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || "";
    this.userStates = new Map();
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
      console.error("Telegram Bot Error:", err as Error);
    });
  }

  private async handleStart(ctx: Context) {
    const message = `Welcome to Catoff! 🎮

Main Commands:
/search_player - Search for a player
/get_matches - Get player's match history
/create_challenge - Create a challenge
/accept_challenge - Accept a challenge
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
      await ctx.reply("Now please enter the tagline:");
      return;
    }

    const tagLine = ctx.message.text;

    try {
      const matchIdsResponse = await fetch(
        `${API_URL}/api/lol/match/v5/matches/by-puuid/${encodeURIComponent(
          userState.data.puuid
        )}/ids?region=${encodeURIComponent(tagLine)}`
      );

      if (!matchIdsResponse.ok) {
        throw new Error("Failed to fetch match IDs");
      }

      const matchIds = await matchIdsResponse.json();

      const recentMatches = await Promise.all(
        matchIds.slice(0, 5).map(async (matchId: string) => {
          const matchResponse = await fetch(
            `${API_URL}/api/lol/match/v5/matches/${matchId}?region=${encodeURIComponent(
              tagLine
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

    const wagerAmount = ctx.message.text;
    const [gameName, tagLine] = userState.data.riotId.split("#");

    try {
      const response = await fetch(
        `${API_URL}/api/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
          gameName
        )}/${encodeURIComponent(tagLine)}`,
        { headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        throw new Error("Invalid LoL account");
      }

      const challengeId = "CH_" + Math.random().toString(36).substring(2, 9);

      await this.broadcastChallenge({
        creator: ctx.from?.username || "Anonymous",
        wagerAmount: parseFloat(wagerAmount),
        challengeId,
        riotId: userState.data.riotId,
      });

      await ctx.reply(`
🎮 Challenge Created!

ID: ${challengeId}
Creator: ${ctx.from?.username}
LoL Account: ${userState.data.riotId}
Wager: ${wagerAmount} SOL

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

  private async handleAcceptChallenge(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "accept_challenge", data: {} });
    await ctx.reply("Please enter the challenge ID:");
  }

  private async handleAcceptChallengeInput(ctx: Context, userId: number) {
    if (!("text" in ctx.message!)) return;
    const challengeId = ctx.message.text;

    try {
      await this.announceAcceptance({
        challengeId,
        acceptor: ctx.from?.username || "Anonymous",
        riotId: "pending",
      });

      await ctx.reply(`
🤝 Challenge Accepted!

Challenge ID: ${challengeId}
Acceptor: ${ctx.from?.username}

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

  private async handleViewChallenge(ctx: Context) {
    if (!ctx.from) return;
    this.userStates.set(ctx.from.id, { command: "view_challenge", data: {} });
    await ctx.reply("Please enter the challenge ID:");
  }

  private async handleViewChallengeInput(ctx: Context, userId: number) {
    if (!("text" in ctx.message!)) return;
    const challengeId = ctx.message.text;

    try {
      await ctx.reply(`
🔍 Challenge Details (${challengeId}):

Status: Pending implementation`);
    } catch (error) {
      await ctx.reply(
        `❌ Error: ${
          error instanceof Error ? error.message : "Failed to view challenge"
        }`
      );
    }

    this.userStates.delete(userId);
  }

  private async handleHelp(ctx: Context) {
    const helpMessage = `
🎮 Catoff Bot Commands:

Player Commands:
/search_player - Search for a League of Legends player
/get_matches - View player's recent matches
/create_challenge - Create a new challenge
/accept_challenge - Accept an existing challenge
/view_challenge - View details of a specific challenge

Other Commands:
/start - Start the bot
/help - Show this help message

Need more help? Visit catoff.io/help`;

    await ctx.reply(helpMessage);
  }

  async broadcastChallenge(details: ChallengeDetails) {
    const message = `
🎮 New Challenge Created!

Creator: ${details.creator}
LoL Account: ${details.riotId}
Wager: ${details.wagerAmount} SOL
Challenge ID: ${details.challengeId}

Accept at: catoff.io/challenge/${details.challengeId}
Or use /accept_challenge to accept this challenge!`;

    try {
      await this.bot.telegram.sendMessage(this.channelId, message);
      return true;
    } catch (error) {
      console.error("Failed to broadcast challenge:", error);
      return false;
    }
  }

  async announceAcceptance(details: {
    challengeId: string;
    acceptor: string;
    riotId: string;
  }) {
    const message = `
🤝 Challenge Accepted!

Challenge ID: ${details.challengeId}
Acceptor: ${details.acceptor}
LoL Account: ${details.riotId}

The match can now begin! Good luck to both players!`;

    try {
      await this.bot.telegram.sendMessage(this.channelId, message);
      return true;
    } catch (error) {
      console.error("Failed to announce acceptance:", error);
      return false;
    }
  }

  async announceWinner(details: WinnerDetails) {
    const statsMessage = details.stats
      ? `\nMatch Stats:
K/D/A: ${details.stats.kills}/${details.stats.deaths}/${details.stats.assists}`
      : "";

    const message = `
🏆 Challenge Complete!

Winner: ${details.winner}
Prize: ${details.amount} SOL
Challenge ID: ${details.challengeId}${statsMessage}

Create your own challenge at catoff.io!`;

    try {
      await this.bot.telegram.sendMessage(this.channelId, message);
      return true;
    } catch (error) {
      console.error("Failed to announce winner:", error);
      return false;
    }
  }

  start() {
    this.bot.launch();
    console.log("Telegram bot started");

    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }

  stop() {
    this.bot.stop();
  }
}

export default TelegramService;
