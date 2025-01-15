// frontend/components/gaming/PlayerSearch.tsx

import React, { useState } from "react";
import { Search } from "lucide-react";
import Button from "../common/Button";

interface PlayerSearchProps {
  onPlayerFound?: (playerData: CombinedSummonerData) => void;
}

interface CombinedSummonerData {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
  tagLine: string;
  gameName: string;
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({ onPlayerFound }) => {
  const [playerName, setPlayerName] = useState("");
  const [tagline, setTagline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!playerName || !tagline) {
      setError("Please enter both player name and tagline");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/riot/summoner/${encodeURIComponent(
          playerName
        )}/${encodeURIComponent(tagline)}`
      );

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to find player");
      }

      onPlayerFound?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find player");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-blue-500/20">
      <h2 className="text-2xl font-bold mb-6 text-white">Search Player</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Player Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full bg-gray-700/50 rounded-lg border border-blue-500/30 p-3 text-white"
            placeholder="Enter player name"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Tagline
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full bg-gray-700/50 rounded-lg border border-blue-500/30 p-3 text-white"
            placeholder="Enter tagline (e.g., EUW)"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        <Button
          onClick={handleSearch}
          isLoading={isLoading}
          disabled={!playerName || !tagline || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <span className="mr-2">Searching...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              <span>Search Player</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PlayerSearch;
