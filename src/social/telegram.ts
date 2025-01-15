// src/social/telegram.ts
import { Telegraf, Context } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import dotenv from "dotenv";

dotenv.config();

interface ChallengeDetails {
  creator: string;
  wagerAmount: number;
  challengeId: string;
}

interface WinnerDetails {
  winner: string;
  amount: number;
  challengeId: string;
}

class TelegramService {
  announceAcceptance(arg0: {
    challengeId: string;
    acceptor: any;
    riotId: any;
  }): any {
    throw new Error("Method not implemented.");
  }
  public bot: Telegraf;
  private channelId: string;

  constructor() {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error(
        "TELEGRAM_BOT_TOKEN is not defined in environment variables"
      );
    }

    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
    this.channelId = process.env.TELEGRAM_CHANNEL_ID || "";
    this.setupCommands();
  }

  private setupCommands() {
    // Start command
    this.bot.command("start", this.handleStart.bind(this));

    // Challenge commands
    this.bot.command("create_challenge", this.handleCreateChallenge.bind(this));
    this.bot.command("accept_challenge", this.handleAcceptChallenge.bind(this));
    this.bot.command("view_challenge", this.handleViewChallenge.bind(this));

    // Help command
    this.bot.command("help", this.handleHelp.bind(this));

    // Handle errors
    this.bot.catch((err: unknown) => {
      console.error("Telegram Bot Error:", err as Error);
    });
  }

  private async handleStart(ctx: Context) {
    const message = `
Welcome to Catoff! 🎮

Available commands:
/create_challenge - Create a new gaming challenge
/accept_challenge - Accept an existing challenge
/view_challenge - View challenge details
/help - Show this help message

For more information, visit: catoff.io
    `;
    await ctx.reply(message);
  }

  private async handleCreateChallenge(ctx: Context) {
    if ("text" in ctx.message!) {
      const text = ctx.message.text;
      const args = text.split(" ");

      if (args.length !== 3) {
        await ctx.reply(
          "Usage: /create_challenge <LoL_username#tag> <wager_amount_in_SOL>"
        );
        return;
      }

      // TODO: Implement challenge creation logic
      await ctx.reply("Creating challenge... (Implementation pending)");
    }
  }

  private async handleAcceptChallenge(ctx: Context) {
    if ("text" in ctx.message!) {
      const text = ctx.message.text;
      const args = text.split(" ");

      if (args.length !== 2) {
        await ctx.reply("Usage: /accept_challenge <challenge_id>");
        return;
      }

      // TODO: Implement challenge acceptance logic
      await ctx.reply("Accepting challenge... (Implementation pending)");
    }
  }

  private async handleViewChallenge(ctx: Context) {
    if ("text" in ctx.message!) {
      const text = ctx.message.text;
      const args = text.split(" ");

      if (args.length !== 2) {
        await ctx.reply("Usage: /view_challenge <challenge_id>");
        return;
      }

      // TODO: Implement challenge viewing logic
      await ctx.reply("Fetching challenge details... (Implementation pending)");
    }
  }

  private async handleHelp(ctx: Context) {
    const helpMessage = `
Catoff Bot Commands:

🎮 Challenge Commands:
/create_challenge <username#tag> <amount> - Create a new challenge
/accept_challenge <challenge_id> - Accept an existing challenge
/view_challenge <challenge_id> - View challenge details

ℹ️ Other Commands:
/start - Start the bot
/help - Show this help message

Need more help? Visit catoff.io/help
    `;
    await ctx.reply(helpMessage);
  }

  async broadcastChallenge(details: ChallengeDetails) {
    const message = `
🎮 New Challenge Created!

Creator: ${details.creator}
Wager: ${details.wagerAmount} SOL
Challenge ID: ${details.challengeId}

Accept this challenge at:
catoff.io/challenge/${details.challengeId}
    `;

    try {
      await this.bot.telegram.sendMessage(this.channelId, message);
      return true;
    } catch (error) {
      console.error("Failed to broadcast challenge:", error);
      return false;
    }
  }

  async announceWinner(details: WinnerDetails) {
    const message = `
🏆 Challenge Complete!

Winner: ${details.winner}
Prize: ${details.amount} SOL
Challenge ID: ${details.challengeId}

Create your own challenge at catoff.io
    `;

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

    // Enable graceful stop
    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }

  stop() {
    this.bot.stop();
  }
}

export default TelegramService;
