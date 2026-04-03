import { db } from "./src/db";
import { users } from "./src/db/schema";

try {
  console.log("Connecting to database...");
  const result = await db.select().from(users);
  console.log("Connected! Users count:", result.length);
  process.exit(0);
} catch (error) {
  console.error("Connection failed:", error);
  process.exit(1);
}
