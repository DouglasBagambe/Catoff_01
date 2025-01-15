// types/index.ts

export interface PlayerData {
  puuid: string;
  gameName: string;
  tagLine: string;
  accountId?: string;
  profileIconId?: number;
  summonerLevel?: number;
}

export interface MatchData {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  participants: Array<any>;
}

export interface ChallengeData {
  id: string;
  creator: string;
  challenger?: string;
  wagerAmount: number;
  isActive: boolean;
  isComplete: boolean;
  createdAt: number;
  stats?: any;
}

export interface CreateChallengeParams {
  stats: any;
  wagerAmount: number;
  riotId: string;
}

export interface AcceptChallengeParams {
  challengeId: string;
  wagerAmount: number;
  riotId: string;
}

export interface CompleteChallengeParams {
  challengeId: string;
  winner: string;
  stats: any;
}

export type ChallengeStatus =
  | "idle"
  | "creating"
  | "active"
  | "accepted"
  | "completed";
