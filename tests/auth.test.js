import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
jest.setTimeout(20000); // 20 seconds timeout

describe("Auth Routes", () => {
  let token;
  let email;

  beforeAll(async () => {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Clear users collection to avoid duplicate registration errors
    await mongoose.connection.db.collection("users").deleteMany({});

    // Generate a unique email for this test run
    email = `testuser_${Date.now()}@example.com`;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email,
        password: "123456",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(email);
    expect(res.body.password).toBeUndefined(); // password should not be returned
  });

  it("should login user and return token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });
});