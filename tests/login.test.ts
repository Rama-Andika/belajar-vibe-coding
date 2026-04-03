import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src/index";
import { db } from "../src/db";
import { users, session } from "../src/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

describe("User Login Integration Tests", () => {
  
  beforeEach(async () => {
    // Cleanup
    await db.delete(session);
    await db.delete(users);
  });

  it("should login successfully and return a token", async () => {
    // First, register a user
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      name: "Rama",
      email: "rama@gmail.com",
      password: hashedPassword,
    });

    // Now, login
    const response = await app.handle(
      new Request("http://localhost/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "rama@gmail.com",
          password: "password123",
        }),
      })
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as { message: string, data: string };
    expect(data.message).toBe("Ok");
    expect(data.data).toBeDefined();

    // Verify session exists in DB
    const [savedSession] = await db.select().from(session).where(eq(session.token, data.data));
    expect(savedSession).toBeDefined();
    expect(savedSession?.token).toBe(data.data);
  }, 20000);

  it("should fail with invalid password", async () => {
    // Register
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      name: "Rama",
      email: "rama@gmail.com",
      password: hashedPassword,
    });

    // Login with wrong password
    const response = await app.handle(
      new Request("http://localhost/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "rama@gmail.com",
          password: "wrongpassword",
        }),
      })
    );

    expect(response.status).toBe(401);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("email or password is not valid!");
  }, 20000);

  it("should fail when user does not exist", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      })
    );

    expect(response.status).toBe(401);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("email or password is not valid!");
  }, 20000);

  it("should fail with invalid email format", async () => {
    const response = await app.handle(
      new Request("http://localhost/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "not-an-email",
          password: "password123",
        }),
      })
    );

    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("Validation failed");
  }, 20000);
});
