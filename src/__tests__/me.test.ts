import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../index";
import { db } from "../db";
import { users, session } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

describe("Get Current User Integration Tests", () => {
  
  beforeEach(async () => {
    // Cleanup
    await db.delete(session);
    await db.delete(users);
  });

  it("should return the user profile with a valid token", async () => {
    // 1. Register and Login a user to get a token
    const userData = {
      name: "Test User",
      email: "me@example.com",
      password: "password123",
    };
    
    // Manual insert to be sure (since register/login are tested elsewhere)
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await db.insert(users).values({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    });

    // Login
    const loginResponse = await app.handle(
      new Request("http://localhost/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      })
    );
    const loginData = (await loginResponse.json()) as { data: string };
    const token = loginData.data;

    // 2. Call /api/user/me
    const response = await app.handle(
      new Request("http://localhost/api/user/me", {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}` 
        },
      })
    );

    expect(response.status).toBe(200);
    const result = (await response.json()) as { message: string, data: any };
    expect(result.message).toBe("Ok");
    expect(result.data.name).toBe(userData.name);
    expect(result.data.email).toBe(userData.email);
    expect(result.data.password).toBeUndefined(); // Security check
    expect(result.data.id).toBeDefined();
  }, 20000);

  it("should return 401 for missing token", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/user/me", {
        method: "GET",
      })
    );

    expect(response.status).toBe(401);
    const result = (await response.json()) as { error: string };
    expect(result.error).toBe("unauthorized");
  }, 20000);

  it("should return 401 for invalid token format", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/user/me", {
        method: "GET",
        headers: { 
          "Authorization": "InvalidFormat token123" 
        },
      })
    );

    expect(response.status).toBe(401);
    const result = (await response.json()) as { error: string };
    expect(result.error).toBe("unauthorized");
  }, 20000);

  it("should return 401 for non-existent token", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/user/me", {
        method: "GET",
        headers: { 
          "Authorization": "Bearer non-existent-token" 
        },
      })
    );

    expect(response.status).toBe(401);
    const result = (await response.json()) as { error: string };
    expect(result.error).toBe("unauthorized");
  }, 20000);
});
