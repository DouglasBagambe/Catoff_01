import { ethers } from "ethers";
import { ZKService } from "./zk";

export class BlockchainService {
  private static instance: BlockchainService;
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;
  private zkService: ZKService;

  private constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(
      process.env.ETHEREUM_RPC_URL
    );
    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      CONTRACT_ABI, // You'll need to import this
      this.provider
    );
    this.zkService = ZKService.getInstance();
  }

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  async createChallenge(
    stats: any,
    wagerAmount: string,
    signer: ethers.Signer
  ) {
    try {
      const { proof, publicSignals } = await this.zkService.generateProof(
        stats
      );
      const connectedContract = this.contract.connect(signer);

      const tx = await connectedContract.createChallenge(
        publicSignals[0], // statsHash
        {
          value: ethers.utils.parseEther(wagerAmount),
        }
      );

      return await tx.wait();
    } catch (error) {
      console.error("Error creating challenge:", error);
      throw error;
    }
  }

  async acceptChallenge(
    challengeId: string,
    wagerAmount: string,
    signer: ethers.Signer
  ) {
    try {
      const connectedContract = this.contract.connect(signer);
      const tx = await connectedContract.acceptChallenge(challengeId, {
        value: ethers.utils.parseEther(wagerAmount),
      });
      return await tx.wait();
    } catch (error) {
      console.error("Error accepting challenge:", error);
      throw error;
    }
  }
  async completeChallenge(
    challengeId: string,
    winner: string,
    stats: any,
    signer: ethers.Signer
  ) {
    try {
      const { proof } = await this.zkService.generateProof(stats);
      const connectedContract = this.contract.connect(signer);

      const tx = await connectedContract.completeChallenge(
        challengeId,
        winner,
        proof,
        {
          gasLimit: 300000, // Adjust as needed
        }
      );

      return await tx.wait();
    } catch (error) {
      console.error("Error completing challenge:", error);
      throw error;
    }
  }

  async getChallengeDetails(challengeId: string) {
    try {
      const challenge = await this.contract.challenges(challengeId);
      return {
        creator: challenge.creator,
        wagerAmount: ethers.utils.formatEther(challenge.wagerAmount),
        isActive: challenge.isActive,
        challenger: challenge.challenger,
        isComplete: challenge.isComplete,
        createdAt: new Date(challenge.createdAt.toNumber() * 1000),
      };
    } catch (error) {
      console.error("Error getting challenge details:", error);
      throw error;
    }
  }
}
