import RiotAPI from "./riot";

describe("RiotAPI", () => {
  // Mock API responses
  const mockSummonerData = {
    id: "12345",
    accountId: "acc12345",
    puuid: "puuid12345",
    name: "TestSummoner",
    profileIconId: 1,
    revisionDate: 1623456789,
    summonerLevel: 100,
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test("getSummoner should return summoner data", async () => {
    // Mock axios get request
    jest.spyOn(global, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSummonerData),
      } as Response)
    );

    const result = await RiotAPI.getSummoner("TestSummoner");
    expect(result).toEqual(mockSummonerData);
  });

  test("getSummoner should handle errors", async () => {
    // Mock error response
    jest
      .spyOn(global, "fetch")
      .mockImplementation(() => Promise.reject(new Error("API Error")));

    await expect(RiotAPI.getSummoner("TestSummoner")).rejects.toThrow(
      "API Error"
    );
  });
});
