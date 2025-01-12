import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { GamingChallenge } from "../../target/types/gaming_challenge";
import { expect } from "chai";

describe("gaming_challenge", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GamingChallenge as Program<GamingChallenge>;

  it("Creates a challenge", async () => {
    const challenge = anchor.web3.Keypair.generate();
    const wagerAmount = new anchor.BN(1000000000); // 1 SOL
    const statsHash = Buffer.alloc(32, 1);

    await program.methods
      .createChallenge(wagerAmount, statsHash)
      .accounts({
        challenge: challenge.publicKey,
        creator: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([challenge])
      .rpc();

    const account = await program.account.challenge.fetch(challenge.publicKey);
    expect(account.creator.toString()).to.equal(
      provider.wallet.publicKey.toString()
    );
    expect(account.wagerAmount.toNumber()).to.equal(wagerAmount.toNumber());
  });

  // Add more tests...
});
