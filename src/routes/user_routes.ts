import { Elysia, t } from "elysia";
import { registerUser } from "../services/user_service";

export const userRoutes = new Elysia({ prefix: "/api/user" })
  .post("/register", async ({ body, set }) => {
    try {
      const result = await registerUser(body);
      return result;
    } catch (error: any) {
      set.status = 400; // Or 409 Conflict
      return { error: error.message };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
    })
  });
