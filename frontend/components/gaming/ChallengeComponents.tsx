// frontend/components/gaming/ChallengeComponents.tsx
import React, { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSolanaChallenge } from "@/hooks/useSolanaChallenge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sword, Trophy, User, Wallet, Clock, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

interface Challenge {
  id: string;
  creator: string;
  riotId: string;
  wagerAmount: number;
  challenger?: string;
  isComplete?: boolean;
  stats?: {
    kills: number;
    deaths: number;
    assists: number;
  };
}

// Create Challenge Dialog Component
const CreateChallengeDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreateChallenge: (challengeData: Omit<Challenge, "id">) => void;
}> = ({ isOpen, onClose, onCreateChallenge }) => {
  const [riotId, setRiotId] = useState("");
  const [wagerAmount, setWagerAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { createChallenge } = useSolanaChallenge();
  const { connected } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      const challengeId = await createChallenge(parseFloat(wagerAmount));
      onCreateChallenge({
        creator: "user",
        riotId,
        wagerAmount: parseFloat(wagerAmount),
      });
      toast.success("Challenge created successfully!");
      onClose();
      setRiotId("");
      setWagerAmount("");
    } catch (error) {
      toast.error("Failed to create challenge");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <Sword className="w-6 h-6 text-purple-400" />
            Create Challenge
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up a new gaming challenge
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Riot ID (format: username#tagline)
            </label>
            <input
              type="text"
              value={riotId}
              onChange={(e) => setRiotId(e.target.value)}
              className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter Riot ID"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Wager Amount (SOL)
            </label>
            <input
              type="number"
              step="0.01"
              value={wagerAmount}
              onChange={(e) => setWagerAmount(e.target.value)}
              className="w-full bg-gray-700 rounded-lg border border-gray-600 p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter wager amount"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
            >
              Create Challenge
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Challenge List Component
const ChallengeList: React.FC<{
  challenges: Challenge[];
  onViewChallenge: (challenge: Challenge) => void;
}> = ({ challenges, onViewChallenge }) => {
  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <Card
          key={challenge.id}
          className="bg-gray-700/50 border border-gray-600"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-white text-lg font-semibold">
              Challenge #{challenge.id}
            </CardTitle>
            <div className="flex items-center gap-2">
              {challenge.isComplete ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Clock className="w-5 h-5 text-yellow-400" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">
                  Creator: {challenge.creator}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">
                  {challenge.wagerAmount} SOL
                </span>
              </div>
            </div>
            <button
              onClick={() => onViewChallenge(challenge)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              View Challenge
            </button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Challenge Details Dialog Component
const ChallengeDetailsDialog: React.FC<{
  challenge?: Challenge;
  isOpen: boolean;
  onClose: () => void;
  onAcceptChallenge: (challengeId: string) => void;
}> = ({ challenge, isOpen, onClose, onAcceptChallenge }) => {
  const [showConfirmAccept, setShowConfirmAccept] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { acceptChallenge } = useSolanaChallenge();
  const { connected } = useWallet();

  const handleAcceptChallenge = async (challengeId: string) => {
    if (!connected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    try {
      await acceptChallenge(challengeId);
      onAcceptChallenge(challengeId);
      toast.success("Challenge accepted successfully!");
      setShowConfirmAccept(false);
      onClose();
    } catch (error) {
      toast.error("Failed to accept challenge");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!challenge) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gray-800 text-white border border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Challenge Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Creator</div>
                <div className="text-white">{challenge.creator}</div>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Wager</div>
                <div className="text-white">{challenge.wagerAmount} SOL</div>
              </div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Riot ID</div>
              <div className="text-white">{challenge.riotId}</div>
            </div>
            {!challenge.challenger && !challenge.isComplete && (
              <button
                onClick={() => setShowConfirmAccept(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
              >
                Accept Challenge
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmAccept} onOpenChange={setShowConfirmAccept}>
        <AlertDialogContent className="bg-gray-800 text-white border border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Challenge</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to accept this challenge? This will require
              a wager of {challenge.wagerAmount} SOL.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                onAcceptChallenge(challenge.id);
                setShowConfirmAccept(false);
                onClose();
              }}
            >
              Accept
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { CreateChallengeDialog, ChallengeList, ChallengeDetailsDialog };
