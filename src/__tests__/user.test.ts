import { describe, expect, it, beforeAll, beforeEach } from "bun:test";
import { app } from "../index";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

describe("User Registration Integration Tests", () => {
  
  // Cleanup before each test to ensure a clean state
  beforeEach(async () => {
    await db.delete(users);
  });

  describe("Service Layer: registerUser", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const { registerUser } = await import("../services/user-service");
      const result = await registerUser(userData);

      expect(result.message).toBe("Ok");

      const [storedUser] = await db.select().from(users).where(eq(users.email, userData.email));
      expect(storedUser).toBeDefined();
      if (storedUser) {
        expect(storedUser.name).toBe(userData.name);
        
        // Verify password hashing
        const isMatch = await bcrypt.compare(userData.password, storedUser.password);
        expect(isMatch).toBe(true);
        expect(storedUser.password).not.toBe(userData.password);
      }
    }, 20000);

    it("should throw error for duplicate email", async () => {
      const userData = {
        name: "User 1",
        email: "dup@example.com",
        password: "password123",
      };

      const { registerUser } = await import("../services/user-service");
      await registerUser(userData);

      // Try registering again with the same email
      try {
        await registerUser(userData);
        throw new Error("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toBe("username or email already exists");
      }
    }, 20000);
  });

  describe("Route Layer: POST /api/user/register", () => {
    it("should return 200 and 'Ok' on successful registration", async () => {
      const payload = {
        name: "Route User",
        email: "route@example.com",
        password: "password123",
      };

      const response = await app.handle(
        new Request("http://localhost/api/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );

      expect(response.status).toBe(200);
      const data = await response.json() as { message: string };
      expect(data.message).toBe("Ok");
    }, 20000);

    it("should return 400 when email already exists", async () => {
      const payload = {
        name: "New User",
        email: "existing@example.com",
        password: "password123",
      };

      // First registration
      await app.handle(
        new Request("http://localhost/api/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );

      // Second registration with same email
      const response = await app.handle(
        new Request("http://localhost/api/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );

      expect(response.status).toBe(400);
      const data = await response.json() as { error: string };
      expect(data.error).toBe("username or email already exists");
    }, 20000);

    it("should return 400 for missing fields (Elysia Validation)", async () => {
      const payload = {
        name: "Missing Email",
        // email is missing
        password: "password123",
      };

      const response = await app.handle(
        new Request("http://localhost/api/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );

      // Elysia returns 422 for validation fail by default
      expect(response.status).toBe(422);
    }, 20000);
  });
});
