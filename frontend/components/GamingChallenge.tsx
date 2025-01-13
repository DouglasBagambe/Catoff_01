import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Clock,
  Sword,
  Trophy,
  Wallet,
  Users,
  ArrowRight,
  ShieldAlert,
  Check,
  Search,
  GameController,
  User,
} from "lucide-react";
import { Program, web3 } from "@project-serum/anchor";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

const RIOT_API_KEY = "RGAPI-63488878-6a0e-49a2-b38b-20782eabfb1e";
const PROGRAM_ID = new PublicKey(
  "GBUZP3faF5m8nctD6NwoC5ZCGNbq95d1g53LuR7U97FS"
);

const GamingChallenge = () => {
  const wallet = useWallet();
  const [playerName, setPlayerName] = useState("");
  const [tagline, setTagline] = useState("");
  const [wagerAmount, setWagerAmount] = useState("");
  const [playerData, setPlayerData] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [challengeStatus, setChallengeStatus] = useState("idle");
  const [challengeAccount, setChallengeAccount] = useState("");
  const [challengerWallet, setChallengerWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${playerName}/${tagline}`,
        {
          headers: {
            "X-Riot-Token": RIOT_API_KEY,
          },
        }
      );
      const data = await response.json();
      setPlayerData(data);
      await fetchMatches(data.puuid);
    } catch (error) {
      setError("Failed to fetch player data");
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async (puuid) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=5`,
        {
          headers: {
            "X-Riot-Token": RIOT_API_KEY,
          },
        }
      );
      const matchIds = await response.json();
      setMatches(matchIds);
    } catch (error) {
      setError("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async () => {
    if (!wallet.connected) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setLoading(true);
      setChallengeStatus("creating");

      // Create a new account for the challenge
      const challengeKeypair = web3.Keypair.generate();
      setChallengeAccount(challengeKeypair.publicKey.toString());

      // Calculate stats hash (placeholder)
      const statsHash = new Uint8Array(32).fill(1);

      // Create the challenge instruction
      const createChallengeIx = await Program.createInstruction(
        PROGRAM_ID,
        {
          accounts: {
            challenge: challengeKeypair.publicKey,
            creator: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
        },
        "createChallenge",
        {
          wagerAmount: new web3.BN(Number(wagerAmount)),
          statsHash,
        }
      );

      const transaction = new Transaction().add(createChallengeIx);
      const signature = await wallet.sendTransaction(transaction, [
        challengeKeypair,
      ]);

      setChallengeStatus("active");
    } catch (error) {
      setError("Failed to create challenge");
      setChallengeStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const acceptChallenge = async () => {
    if (!challengerWallet || !challengeAccount) {
      setError("Missing challenger wallet or challenge account");
      return;
    }

    try {
      setLoading(true);

      const acceptChallengeIx = await Program.createInstruction(
        PROGRAM_ID,
        {
          accounts: {
            challenge: new PublicKey(challengeAccount),
            challenger: new PublicKey(challengerWallet),
            systemProgram: SystemProgram.programId,
          },
        },
        "acceptChallenge"
      );

      const transaction = new Transaction().add(acceptChallengeIx);
      await wallet.sendTransaction(transaction, []);

      setChallengeStatus("accepted");
    } catch (error) {
      setError("Failed to accept challenge");
    } finally {
      setLoading(false);
    }
  };

  const completeChallenge = async (winner) => {
    try {
      setLoading(true);

      // Placeholder ZK proof
      const zkProof = new Uint8Array(32).fill(0);

      const completeChallengeIx = await Program.createInstruction(
        PROGRAM_ID,
        {
          accounts: {
            challenge: new PublicKey(challengeAccount),
            creator: wallet.publicKey,
            challenger: new PublicKey(challengerWallet),
          },
        },
        "completeChallenge",
        {
          winner: new PublicKey(winner),
          zkProof,
        }
      );

      const transaction = new Transaction().add(completeChallengeIx);
      await wallet.sendTransaction(transaction, []);

      setChallengeStatus("completed");
    } catch (error) {
      setError("Failed to complete challenge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="border-b border-blue-500/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Gaming Challenges
          </h1>
          <WalletMultiButton />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-400" />
              Player Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Player Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-gray-700/50 rounded-lg border border-blue-500/30 p-3"
                  placeholder="Enter player name (e.g., Caps)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-gray-700/50 rounded-lg border border-blue-500/30 p-3"
                  placeholder="Enter tagline (e.g., EUW)"
                />
              </div>

              <button
                onClick={fetchPlayerData}
                disabled={loading || !playerName || !tagline}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Fetch Player Data
              </button>

              {playerData && (
                <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
                  <h3 className="font-bold mb-2">Player Info:</h3>
                  <p>PUUID: {playerData.puuid}</p>
                  <p>Game Name: {playerData.gameName}</p>
                  <p>Tag Line: {playerData.tagLine}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <GameController className="w-5 h-5 text-green-400" />
                Recent Matches
              </h3>
              <div className="space-y-2">
                {matches.map((matchId, index) => (
                  <button
                    key={matchId}
                    onClick={() => setSelectedMatch(matchId)}
                    className={`w-full p-4 rounded-lg border transition-all duration-200 ${
                      selectedMatch === matchId
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-blue-500/20 bg-gray-700/30 hover:bg-gray-700/50"
                    }`}
                  >
                    Match #{index + 1}: {matchId}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sword className="w-5 h-5 text-purple-400" />
                Challenge Setup
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Wager Amount (SOL)
                  </label>
                  <input
                    type="number"
                    value={wagerAmount}
                    onChange={(e) => setWagerAmount(e.target.value)}
                    className="w-full bg-gray-700/50 rounded-lg border border-blue-500/30 p-3"
                    placeholder="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Challenger Wallet Address
                  </label>
                  <input
                    type="text"
                    value={challengerWallet}
                    onChange={(e) => setChallengerWallet(e.target.value)}
                    className="w-full bg-gray-700/50 rounded-lg border border-blue-500/30 p-3"
                    placeholder="Enter challenger's wallet address"
                  />
                </div>

                <button
                  onClick={createChallenge}
                  disabled={
                    loading ||
                    !selectedMatch ||
                    !wagerAmount ||
                    !wallet.connected
                  }
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Create Challenge
                </button>

                {challengeAccount && (
                  <>
                    <button
                      onClick={acceptChallenge}
                      disabled={
                        loading ||
                        challengeStatus !== "active" ||
                        !challengerWallet
                      }
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Accept Challenge
                    </button>

                    <button
                      onClick={() =>
                        completeChallenge(wallet.publicKey.toString())
                      }
                      disabled={loading || challengeStatus !== "accepted"}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Complete Challenge
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        {challengeAccount && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              Challenge Details
            </h3>
            <div className="space-y-2">
              <p className="font-mono">Challenge Account: {challengeAccount}</p>
              <p>Status: {challengeStatus}</p>
              {challengerWallet && (
                <p className="font-mono">Challenger: {challengerWallet}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamingChallenge;
