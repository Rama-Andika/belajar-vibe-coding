import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, session } from "../db/schema";
import { eq, or } from "drizzle-orm";

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const { name, email, password } = data;

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("username or email already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Insert user
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { message: "Ok" };
};

export const loginUser = async (data: { email: string; password: string }) => {
  const { email, password } = data;

  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("email or password is not valid!");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("email or password is not valid!");
  }

  // Generate session token (UUID)
  const token = crypto.randomUUID();

  // Save session to database
  await db.insert(session).values({
    token,
    userId: user.id,
  });

  return {
    message: "Ok",
    data: token,
  };
};

export const getCurrentUser = async (token: string) => {
  // Join session and users
  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(session)
    .innerJoin(users, eq(session.userId, users.id))
    .where(eq(session.token, token))
    .limit(1);

  if (!result) {
    throw new Error("unauthorized");
  }

  return {
    message: "Ok",
    data: result,
  };
};

export const logoutUser = async (token: string) => {
  // Delete session by token
  await db.delete(session).where(eq(session.token, token));

  return {
    message: "Ok",
  };
};
