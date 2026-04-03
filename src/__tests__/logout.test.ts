import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../index";
import { db } from "../db";
import { users, session } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

describe("User Logout Integration Tests", () => {
  
  beforeEach(async () => {
    // Cleanup
    await db.delete(session);
    await db.delete(users);
  });

  it("should logout successfully and invalidate the token", async () => {
    // 1. Register and Login a user
    const userData = {
      name: "Logout User",
      email: "logout@example.com",
      password: "password123",
    };
    
    // Manual insert
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

    // Verify we can access /me
    const meBefore = await app.handle(
      new Request("http://localhost/api/user/me", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      })
    );
    expect(meBefore.status).toBe(200);

    // 2. Call /api/user/logout
    const logoutResponse = await app.handle(
      new Request("http://localhost/api/user/logout", {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}` 
        },
      })
    );

    expect(logoutResponse.status).toBe(200);
    const result = (await logoutResponse.json()) as { message: string };
    expect(result.message).toBe("Ok");

    // 3. Verify /api/user/me now returns 401
    const meAfter = await app.handle(
      new Request("http://localhost/api/user/me", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      })
    );
    expect(meAfter.status).toBe(401);
    const meAfterData = (await meAfter.json()) as { error: string };
    expect(meAfterData.error).toBe("unauthorized");
  }, 20000);

  it("should return 401 for logout without token", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/user/logout", {
        method: "DELETE",
      })
    );

    expect(response.status).toBe(401);
    const result = (await response.json()) as { error: string };
    expect(result.error).toBe("unauthorized");
  }, 20000);
});
