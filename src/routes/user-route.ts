import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/user-service";
import { UnauthorizedError } from "../utils/errors";

export const userRoutes = new Elysia({ prefix: "/api/user" })
  .post("/register", async ({ body }) => {
    await registerUser(body);
    return { message: "Ok" };
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 8 }),
    })
  })
  .post("/login", async ({ body }) => {
    const token = await loginUser(body);
    return {
      message: "Ok",
      data: token
    };
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String(),
    })
  })
  .derive(({ headers }) => {
    return {
      get token() {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          throw new UnauthorizedError();
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
          throw new UnauthorizedError();
        }
        return token;
      }
    };
  })
  .get("/me", async ({ token }) => {
    const user = await getCurrentUser(token);
    return {
      message: "Ok",
      data: user
    };
  })
  .delete("/logout", async ({ token }) => {
    await logoutUser(token);
    return { message: "Ok" };
  });
