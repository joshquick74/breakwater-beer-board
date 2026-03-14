import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, boardSettingsTable } from "@workspace/db";
import {
  UpdateSettingsBody,
  GetSettingsResponse,
  UpdateSettingsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateSettings() {
  let [settings] = await db.select().from(boardSettingsTable);
  if (!settings) {
    [settings] = await db.insert(boardSettingsTable).values({}).returning();
  }
  return settings;
}

router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  res.json(GetSettingsResponse.parse(settings));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await getOrCreateSettings();

  const [settings] = await db
    .update(boardSettingsTable)
    .set(parsed.data)
    .where(eq(boardSettingsTable.id, existing.id))
    .returning();

  res.json(UpdateSettingsResponse.parse(settings));
});

export default router;
