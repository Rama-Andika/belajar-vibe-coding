import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/user-service";

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
  })
  .post("/login", async ({ body, set }) => {
    try {
      return await loginUser(body);
    } catch (error: any) {
      set.status = 401;
      return { error: error.message };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  });
