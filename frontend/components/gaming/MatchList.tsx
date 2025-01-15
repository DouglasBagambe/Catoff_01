import React from "react";
import { Gamepad2 } from "lucide-react";

interface Match {
  id: string;
  timestamp: number;
  gameType: string;
  result: "win" | "loss";
  kills: number;
  deaths: number;
  assists: number;
}
interface MatchListProps {
  puuid: string;
  matches: Match[];
  onMatchSelect: (match: Match) => void;
  selectedMatchId?: string;
}

const MatchList: React.FC<MatchListProps> = ({
  matches,
  onMatchSelect,
  selectedMatchId,
}) => {
  if (!matches.length) {
    return (
      <div className="text-center p-6 text-gray-400">No matches found</div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <button
          key={match.id}
          onClick={() => onMatchSelect?.(match)}
          className={`w-full p-4 rounded-lg border transition-all duration-200 ${
            selectedMatchId === match.id
              ? "border-blue-400 bg-blue-500/20"
              : "border-blue-500/20 bg-gray-700/30 hover:bg-gray-700/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="font-semibold text-white">{match.gameType}</div>
                <div className="text-sm text-gray-400">
                  {new Date(match.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-bold ${
                  match.result === "win" ? "text-green-400" : "text-red-400"
                }`}
              >
                {match.result.toUpperCase()}
              </div>
              <div className="text-sm text-gray-400">
                {match.kills}/{match.deaths}/{match.assists}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default MatchList;
