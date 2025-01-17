// src/solana/gaming_challenge_service.ts

import { Connection, PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider, Wallet, BN } from "@project-serum/anchor";
// Import the JSON directly
import IDL from "../../gaming_challenge/target/idl/gaming_challenge.json";

// You can still keep the type if you want
type GamingChallenge = typeof IDL;

export class GamingChallengeService {
  private connection: Connection;
  private provider: AnchorProvider;
  private program: Program<GamingChallenge>;

  constructor(connection: Connection, wallet: Wallet, programId: PublicKey) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    // Use the JSON IDL directly
    this.program = new Program(IDL, programId, this.provider);
  }

  async initialize(authority: Keypair): Promise<string> {
    try {
      const stateAddress = PublicKey.findProgramAddressSync(
        [Buffer.from("state")],
        this.program.programId
      )[0];

      const signature = await this.program.methods
        .initialize()
        .accounts({
          authority: authority.publicKey,
          state: stateAddress,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      return signature;
    } catch (error) {
      console.error("Error initializing program:", error);
      throw error;
    }
  }

  async createChallenge(
    creator: Keypair,
    wagerAmount: number,
    statsHash: number[]
  ): Promise<{ challengeAccount: PublicKey; signature: string }> {
    const challenge = Keypair.generate();

    try {
      const lamports = new BN(wagerAmount * 1e9);
      const signature = await this.program.methods
        .createChallenge(lamports, statsHash)
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
    challengeAccount: PublicKey,
    creator: Keypair,
    challenger: Keypair,
    winner: PublicKey,
    zkProof: Buffer
  ): Promise<string> {
    try {
      const signature = await this.program.methods
        .completeChallenge(winner, zkProof)
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
