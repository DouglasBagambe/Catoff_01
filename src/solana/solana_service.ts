import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { Program, AnchorProvider, Wallet } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import { IDL } from "./gaming_challenge.json";

export class SolanaService {
  private connection: Connection;
  private provider: AnchorProvider;
  private program: Program;

  constructor() {
    // Initialize Solana connection (use your preferred RPC endpoint)
    this.connection = new Connection(
      "https://api.devnet.solana.com",
      "confirmed"
    );

    // Initialize provider with a keypair (you'll need to manage this securely)
    const wallet = new Wallet(Keypair.generate()); // Replace with your bot's wallet
    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });

    // Initialize the program
    this.program = new Program(
      IDL,
      new PublicKey("EqRQ5Ab5XnoE5x5nJWiRX4UzDrEt1VDiKiHmev4FsGS9"),
      this.provider
    );
  }

  async createChallenge(
    creator: Keypair,
    wagerAmount: number,
    statsHash: number[]
  ): Promise<{ challengeAccount: PublicKey; signature: string }> {
    const challenge = Keypair.generate();

    try {
      const signature = await this.program.methods
        .createChallenge(new anchor.BN(wagerAmount), Buffer.from(statsHash))
        .accounts({
          challenge: challenge.publicKey,
          creator: creator.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([creator, challenge])
        .rpc();

      return {
        challengeAccount: challenge.publicKey,
        signature,
      };
    } catch (error) {
      console.error("Error creating challenge:", error);
      throw error;
    }
  }

  async acceptChallenge(
    challenger: Keypair,
    challengeAccount: PublicKey
  ): Promise<string> {
    try {
      const signature = await this.program.methods
        .acceptChallenge()
        .accounts({
          challenge: challengeAccount,
          challenger: challenger.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([challenger])
        .rpc();

      return signature;
    } catch (error) {
      console.error("Error accepting challenge:", error);
      throw error;
    }
  }

  async completeChallenge(
    creator: Keypair,
    challenger: Keypair,
    challengeAccount: PublicKey,
    winner: PublicKey,
    zkProof: number[]
  ): Promise<string> {
    try {
      const signature = await this.program.methods
        .completeChallenge(winner, Buffer.from(zkProof))
        .accounts({
          challenge: challengeAccount,
          creator: creator.publicKey,
          challenger: challenger.publicKey,
        })
        .signers([creator, challenger])
        .rpc();

      return signature;
    } catch (error) {
      console.error("Error completing challenge:", error);
      throw error;
    }
  }

  async getChallengeDetails(challengeAccount: PublicKey) {
    try {
      const challenge = await this.program.account.challenge.fetch(
        challengeAccount
      );
      return challenge;
    } catch (error) {
      console.error("Error fetching challenge details:", error);
      throw error;
    }
  }
}
