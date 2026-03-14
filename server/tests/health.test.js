import request from "supertest";
import app from "../app.js";

describe("Health check", () => {
  it("should return 200 and status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});