import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import { userRoutes } from "./routes/user-route";
import { UnauthorizedError, ConflictError, NotFoundError } from "./utils/errors";

export const app = new Elysia()
  .onError(({ error, set, code }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return { 
        error: "Validation failed", 
        details: error.message 
      };
    }

    if (error instanceof UnauthorizedError) {
      set.status = 401;
      return { error: error.message };
    }
    if (error instanceof ConflictError) {
      set.status = 400; 
      return { error: error.message };
    }
    if (error instanceof NotFoundError) {
      set.status = 404;
      return { error: error.message };
    }
    
    // Generic error handling
    console.error(error);
    set.status = 500;
    return { error: "Internal Server Error" };
  })
  .get("/", () => ({ message: "Hello from ElysiaJS + Bun!" }))
  .get("/users", async () => {
    return await db.select().from(users);
  })
  .use(userRoutes);

if (import.meta.main) {
  app.listen(3000);
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}
