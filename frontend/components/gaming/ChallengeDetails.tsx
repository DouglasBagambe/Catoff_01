import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useChallenge } from "@/hooks/useChallenge";
import { Wallet, Sword, CheckCircle, XCircle } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { ChallengeData } from "@/types";

interface ChallengeDetailsProps {
  challenge?: ChallengeData;
  onComplete?: (winner: string) => void;
}

export const ChallengeDetails: React.FC<ChallengeDetailsProps> = ({
  challenge,
  onComplete,
}) => {
  const wallet = useWallet();
  const { completeChallenge, loading, error } = useChallenge();

  const handleCompleteChallenge = async (winner: string) => {
    if (!challenge) return;

    try {
      await completeChallenge({
        challengeId: challenge.id,
        winner,
        stats: challenge.stats!,
      });

      onComplete?.(winner);
    } catch (error) {
      console.error("Failed to complete challenge:", error);
    }
  };

  if (!challenge) {
    return (
      <div className="glass-panel mt-4">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sword className="w-5 h-5 text-purple-400" />
          No Active Challenge
        </h3>
        <p className="text-gray-400">
          Create or accept a challenge to see details here.
        </p>
      </div>
    );
  }

  const isCreator = wallet.publicKey?.toString() === challenge.creator;
  const isChallenger = wallet.publicKey?.toString() === challenge.challenger;
  const canComplete = (isCreator || isChallenger) && !challenge.isComplete;

  return (
    <div className="glass-panel mt-4">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Sword className="w-5 h-5 text-purple-400" />
        Challenge Details
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Status</label>
            <div className="flex items-center gap-2 mt-1">
              {challenge.isComplete ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : challenge.isActive ? (
                <Sword className="w-4 h-4 text-yellow-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className="capitalize">
                {challenge.isComplete
                  ? "Completed"
                  : challenge.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Wager Amount</label>
            <div className="flex items-center gap-2 mt-1">
              <Wallet className="w-4 h-4 text-blue-400" />
              <span>{challenge.wagerAmount} SOL</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Creator</label>
          <div className="font-mono text-sm bg-gray-700/30 p-2 rounded mt-1 break-all">
            {challenge.creator}
          </div>
        </div>

        {challenge.challenger && (
          <div>
            <label className="text-sm text-gray-400">Challenger</label>
            <div className="font-mono text-sm bg-gray-700/30 p-2 rounded mt-1 break-all">
              {challenge.challenger}
            </div>
          </div>
        )}

        {canComplete && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => handleCompleteChallenge(challenge.creator)}
              disabled={loading}
              className="button-primary bg-green-500 hover:bg-green-600"
            >
              Creator Won
            </button>
            <button
              onClick={() =>
                handleCompleteChallenge(challenge.challenger || "")
              }
              disabled={loading || !challenge.challenger}
              className="button-primary bg-blue-500 hover:bg-blue-600"
            >
              Challenger Won
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-400">
          Created: {new Date(challenge.createdAt * 1000).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
