import bcrypt from "bcryptjs";
import { db } from "../db";
import { users } from "../db/schema";
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
