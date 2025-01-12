// src/tests/integration/gaming_challenge.ts
import * as anchor from "@project-serum/anchor";
import { Program, AnchorError } from "@project-serum/anchor";
import { GamingChallenge } from "../../../target/types/gaming_challenge";
import { expect } from "chai";
import { PublicKey, SystemProgram } from "@solana/web3.js";

describe("gaming_challenge", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GamingChallenge as Program<GamingChallenge>;

  // Helper function to get current SOL balance
  async function getBalance(pubkey: PublicKey): Promise<number> {
    return await provider.connection.getBalance(pubkey);
  }

  // Helper function to fund a wallet
  async function fundWallet(pubkey: PublicKey, amount: number): Promise<void> {
    const sig = await provider.connection.requestAirdrop(pubkey, amount);
    await provider.connection.confirmTransaction(sig, "confirmed");
  }

  // Helper function to create a challenge
  async function createTestChallenge(
    wagerAmount: anchor.BN = new anchor.BN(1_000_000_000)
  ) {
    const challenge = anchor.web3.Keypair.generate();
    const statsHash = Buffer.alloc(32, 1);

    await program.methods
      .createChallenge(wagerAmount, statsHash)
      .accounts({
        challenge: challenge.publicKey,
        creator: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([challenge])
      .rpc();

    return { challenge, wagerAmount, statsHash };
  }

  describe("create_challenge", () => {
    it("Creates a challenge successfully", async () => {
      const initialBalance = await getBalance(provider.wallet.publicKey);
      const { challenge, wagerAmount } = await createTestChallenge();

      const account = await program.account.challenge.fetch(
        challenge.publicKey
      );

      // Verify challenge details
      expect(account.creator.toString()).to.equal(
        provider.wallet.publicKey.toString()
      );
      expect(account.wagerAmount.toNumber()).to.equal(wagerAmount.toNumber());
      expect(account.isActive).to.be.true;
      expect(account.isComplete).to.be.false;
      expect(account.challenger.toString()).to.equal(
        PublicKey.default.toString()
      );

      // Verify wager amount was transferred
      const finalBalance = await getBalance(provider.wallet.publicKey);
      const balanceDiff = initialBalance - finalBalance;
      expect(balanceDiff).to.be.approximately(
        wagerAmount.toNumber(),
        10_000_000 // Allow for transaction fees
      );
    });

    it("Fails when creator has insufficient funds", async () => {
      const poorCreator = anchor.web3.Keypair.generate();
      await fundWallet(poorCreator.publicKey, 100_000); // Only fund enough for fees

      const challenge = anchor.web3.Keypair.generate();
      const wagerAmount = new anchor.BN(1_000_000_000);
      const statsHash = Buffer.alloc(32, 1);

      try {
        await program.methods
          .createChallenge(wagerAmount, statsHash)
          .accounts({
            challenge: challenge.publicKey,
            creator: poorCreator.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([poorCreator, challenge])
          .rpc();
        expect.fail("Expected insufficient funds error");
      } catch (error) {
        if (error instanceof Error) {
          expect(error.toString()).to.include("insufficient funds");
        } else {
          throw error;
        }
      }
    });
  });

  describe("accept_challenge", () => {
    it("Accepts an active challenge successfully", async () => {
      const { challenge, wagerAmount } = await createTestChallenge();

      // Generate and fund challenger wallet
      const challenger = anchor.web3.Keypair.generate();
      await fundWallet(challenger.publicKey, 2_000_000_000);

      const initialBalance = await getBalance(challenger.publicKey);

      // Accept the challenge
      await program.methods
        .acceptChallenge(challenge.publicKey)
        .accounts({
          challenge: challenge.publicKey,
          challenger: challenger.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([challenger])
        .rpc();

      const account = await program.account.challenge.fetch(
        challenge.publicKey
      );
      expect(account.challenger.toString()).to.equal(
        challenger.publicKey.toString()
      );

      // Verify wager amount was transferred
      const finalBalance = await getBalance(challenger.publicKey);
      expect(initialBalance - finalBalance).to.be.approximately(
        wagerAmount.toNumber(),
        10_000_000
      );
    });

    it("Fails to accept an already accepted challenge", async () => {
      const { challenge } = await createTestChallenge();

      // First challenger accepts
      const challenger1 = anchor.web3.Keypair.generate();
      await fundWallet(challenger1.publicKey, 2_000_000_000);

      await program.methods
        .acceptChallenge(challenge.publicKey)
        .accounts({
          challenge: challenge.publicKey,
          challenger: challenger1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([challenger1])
        .rpc();

      // Second challenger attempts to accept
      const challenger2 = anchor.web3.Keypair.generate();
      await fundWallet(challenger2.publicKey, 2_000_000_000);

      try {
        await program.methods
          .acceptChallenge(challenge.publicKey)
          .accounts({
            challenge: challenge.publicKey,
            challenger: challenger2.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([challenger2])
          .rpc();
        expect.fail("Expected challenge already accepted error");
      } catch (error) {
        if (error instanceof AnchorError) {
          expect(error.error.errorCode.code).to.equal(
            "ChallengeAlreadyAccepted"
          );
        } else {
          throw error;
        }
      }
    });
  });

  describe("complete_challenge", () => {
    it("Completes a challenge successfully with creator as winner", async () => {
      const { challenge, wagerAmount } = await createTestChallenge();

      // Setup challenger
      const challenger = anchor.web3.Keypair.generate();
      await fundWallet(challenger.publicKey, 2_000_000_000);

      await program.methods
        .acceptChallenge(challenge.publicKey)
        .accounts({
          challenge: challenge.publicKey,
          challenger: challenger.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([challenger])
        .rpc();

      const creatorInitialBalance = await getBalance(provider.wallet.publicKey);

      // Complete challenge
      const zkProof = Buffer.from("dummy_proof");
      await program.methods
        .completeChallenge(provider.wallet.publicKey, zkProof)
        .accounts({
          challenge: challenge.publicKey,
          winner: provider.wallet.publicKey,
        })
        .rpc();

      const account = await program.account.challenge.fetch(
        challenge.publicKey
      );
      expect(account.isComplete).to.be.true;
      expect(account.isActive).to.be.false;

      // Verify winner received total wager
      const creatorFinalBalance = await getBalance(provider.wallet.publicKey);
      expect(creatorFinalBalance - creatorInitialBalance).to.be.approximately(
        wagerAmount.toNumber() * 2,
        10_000_000
      );
    });

    it("Fails with invalid winner", async () => {
      const { challenge } = await createTestChallenge();

      // Setup challenger
      const challenger = anchor.web3.Keypair.generate();
      await fundWallet(challenger.publicKey, 2_000_000_000);

      await program.methods
        .acceptChallenge(challenge.publicKey)
        .accounts({
          challenge: challenge.publicKey,
          challenger: challenger.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([challenger])
        .rpc();

      // Try to complete with invalid winner
      const invalidWinner = anchor.web3.Keypair.generate();
      const zkProof = Buffer.from("dummy_proof");

      try {
        await program.methods
          .completeChallenge(invalidWinner.publicKey, zkProof)
          .accounts({
            challenge: challenge.publicKey,
            winner: invalidWinner.publicKey,
          })
          .rpc();
        expect.fail("Expected invalid winner error");
      } catch (error) {
        if (error instanceof AnchorError) {
          expect(error.error.errorCode.code).to.equal("InvalidWinner");
        } else {
          throw error;
        }
      }
    });
  });
});
