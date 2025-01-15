// pages/index.tsx
import PlayerSearch from "@/components/gaming/PlayerSearch";
import MatchList from "@/components/gaming/MatchList";
import ChallengeForm from "@/components/gaming/ChallengeForm";
import { ChallengeDetails } from "@/components/gaming/ChallengeDetails";
import { useState } from "react";
import { PlayerData, MatchData } from "@/types";

export default function Home() {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <PlayerSearch onPlayerFound={setPlayerData} />
          {playerData && (
            <MatchList
              puuid={playerData.puuid}
              onMatchSelect={(match) =>
                setSelectedMatch(match as unknown as MatchData)
              }
              matches={[]}
            />
          )}
        </div>
        <div>
          {selectedMatch && <ChallengeForm match={selectedMatch} />}
          <ChallengeDetails />
        </div>
      </div>
    </div>
  );
}
