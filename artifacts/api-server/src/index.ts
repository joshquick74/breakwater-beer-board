import app from "./app";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";

async function runMigrations() {
  try {
    await db.execute(sql`ALTER TABLE board_settings ADD COLUMN IF NOT EXISTS board_rotation integer NOT NULL DEFAULT 270`);
  } catch (e) {
    console.warn("Migration check completed with note:", (e as Error).message);
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

runMigrations().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
