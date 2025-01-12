import request from "supertest";
import app from "../../app";
import { BlockchainService } from "../../services/blockchain";
import { ZKService } from "../../services/zk";

describe("Challenge Flow Integration Tests", () => {
  let challengeId: string;

  const mockStats = {
    gameId: 1,
    timestamp: Date.now(),
    kills: 10,
    deaths: 5,
    assists: 8,
    score: 150,
  };

  test("Should create a new challenge", async () => {
    const response = await request(app).post("/challenge/create").send({
      stats: mockStats,
      wagerAmount: "0.1",
      signer: {}, // Mock signer for testing
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("challengeId");
    challengeId = response.body.challengeId;
  });

  test("Should accept an existing challenge", async () => {
    const response = await request(app)
      .post(`/challenge/accept/${challengeId}`)
      .send({
        wagerAmount: "0.1",
        signer: {}, // Mock signer for testing
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("Should complete a challenge", async () => {
    const response = await request(app)
      .post(`/challenge/complete/${challengeId}`)
      .send({
        winner: "0x123...", // Mock address
        stats: mockStats,
        signer: {}, // Mock signer for testing
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
