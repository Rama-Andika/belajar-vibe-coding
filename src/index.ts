import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import { userRoutes } from "./routes/user-route";

export const app = new Elysia()
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
