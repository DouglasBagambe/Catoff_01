// src/apis/riot/riot.test.ts

import axios from "axios";
import RiotAPI from "./riot";
import CacheService from "../../services/cache";

// Mock modules
jest.mock("axios");
jest.mock("../../services/cache");

// Type the mocked modules
const mockedAxios = jest.mocked(axios);
const mockedCacheService = jest.mocked(CacheService);

describe("RiotAPI", () => {
  const mockRiotAccount = {
    puuid: "puuid12345",
    gameName: "TestSummoner",
    tagLine: "EUW",
  };

  const mockSummonerData = {
    id: "12345",
    accountId: "acc12345",
    puuid: "puuid12345",
    name: "TestSummoner",
    profileIconId: 1,
    revisionDate: 1623456789,
    summonerLevel: 100,
  };

  const mockCombinedData = {
    ...mockSummonerData,
    tagLine: "EUW",
    gameName: "TestSummoner",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockedCacheService.get as jest.Mock).mockImplementation(async () => null);
  });

  describe("getSummoner", () => {
    it("should return cached data when available", async () => {
      (mockedCacheService.get as jest.Mock).mockResolvedValueOnce(
        mockCombinedData
      );

      const result = await RiotAPI.getSummoner("TestSummoner", "EUW");

      expect(result).toEqual(mockCombinedData);
      expect(mockedCacheService.get).toHaveBeenCalledWith(
        "summoner:TestSummoner#EUW"
      );
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("should fetch and cache data when cache miss", async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockRiotAccount })
        .mockResolvedValueOnce({ data: mockSummonerData });

      const result = await RiotAPI.getSummoner("TestSummoner", "EUW");

      expect(result).toEqual(mockCombinedData);
      expect(mockedCacheService.get).toHaveBeenCalledWith(
        "summoner:TestSummoner#EUW"
      );
      expect(mockedCacheService.set).toHaveBeenCalledWith(
        "summoner:TestSummoner#EUW",
        mockCombinedData,
        3600
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it("should handle API errors", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(RiotAPI.getSummoner("TestSummoner", "EUW")).rejects.toThrow(
        "Failed to fetch summoner: API Error"
      );
    });
  });

  describe("getMatchHistory", () => {
    const mockMatches = ["match1", "match2"];

    it("should return cached matches when available", async () => {
      (mockedCacheService.get as jest.Mock).mockResolvedValueOnce(mockMatches);

      const result = await RiotAPI.getMatchHistory("puuid123", 2);

      expect(result).toEqual(mockMatches);
      expect(mockedCacheService.get).toHaveBeenCalledWith("matches:puuid123:2");
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("should fetch and cache matches when cache miss", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockMatches });

      const result = await RiotAPI.getMatchHistory("puuid123", 2);

      expect(result).toEqual(mockMatches);
      expect(mockedCacheService.get).toHaveBeenCalledWith("matches:puuid123:2");
      expect(mockedCacheService.set).toHaveBeenCalledWith(
        "matches:puuid123:2",
        mockMatches,
        300
      );
    });

    it("should handle API errors", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(RiotAPI.getMatchHistory("puuid123")).rejects.toThrow(
        "Failed to fetch matches: API Error"
      );
    });
  });

  describe("getMatchDetails", () => {
    const mockMatchData = { gameId: "123" /* other match data */ };

    it("should return cached match details when available", async () => {
      (mockedCacheService.get as jest.Mock).mockResolvedValueOnce(
        mockMatchData
      );

      const result = await RiotAPI.getMatchDetails("EUW1_123");

      expect(result).toEqual(mockMatchData);
      expect(mockedCacheService.get).toHaveBeenCalledWith("match:EUW1_123");
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("should fetch and cache match details when cache miss", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockMatchData });

      const result = await RiotAPI.getMatchDetails("EUW1_123");

      expect(result).toEqual(mockMatchData);
      expect(mockedCacheService.get).toHaveBeenCalledWith("match:EUW1_123");
      expect(mockedCacheService.set).toHaveBeenCalledWith(
        "match:EUW1_123",
        mockMatchData,
        3600
      );
    });

    it("should handle API errors", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(RiotAPI.getMatchDetails("EUW1_123")).rejects.toThrow(
        "Failed to fetch match details: API Error"
      );
    });
  });
});
