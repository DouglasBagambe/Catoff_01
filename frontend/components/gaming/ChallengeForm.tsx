import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useChallenge } from "../../hooks/useChallenge";
import Button from "../common/Button";

interface ChallengeFormProps {
  onChallengeCreated?: (challengeId: string) => void;
}

const ChallengeForm: React.FC<ChallengeFormProps> = ({
  onChallengeCreated,
}) => {
  const wallet = useWallet();
  const { createChallenge, isLoading } = useChallenge();
  const [wagerAmount, setWagerAmount] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!wallet.connected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!wagerAmount || isNaN(parseFloat(wagerAmount))) {
      setError("Please enter a valid wager amount");
      return;
    }

    try {
      const challengeId = await createChallenge(parseFloat(wagerAmount));
      onChallengeCreated?.(challengeId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create challenge"
      );
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
      <h2 className="text-2xl font-bold mb-6 text-white">Create Challenge</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Wager Amount (SOL)
          </label>
          <input
            type="number"
            value={wagerAmount}
            onChange={(e) => setWagerAmount(e.target.value)}
            className="w-full bg-gray-700/50 rounded-lg border border-blue-500/30 p-3 text-white"
            placeholder="0.1"
            step="0.1"
            min="0"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        <Button
          type="submit"
          isLoading={isLoading}
          disabled={!wallet.connected || isLoading}
          className="w-full"
        >
          Create Challenge
        </Button>
      </form>
    </div>
  );
};

export default ChallengeForm;