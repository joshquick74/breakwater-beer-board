import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, beersTable } from "@workspace/db";
import { requireAuth } from "../middleware/auth";
import {
  CreateBeerBody,
  UpdateBeerBody,
  UpdateBeerParams,
  DeleteBeerParams,
  ListBeersResponse,
  UpdateBeerResponse,
  ReorderBeersBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/beers", async (_req, res): Promise<void> => {
  const beers = await db
    .select()
    .from(beersTable)
    .orderBy(asc(beersTable.position));
  res.json(ListBeersResponse.parse(beers));
});

router.post("/beers", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateBeerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const maxPos = await db
    .select({ position: beersTable.position })
    .from(beersTable)
    .orderBy(asc(beersTable.position));
  const nextPosition = maxPos.length > 0 ? Math.max(...maxPos.map(b => b.position)) + 1 : 0;

  const [beer] = await db
    .insert(beersTable)
    .values({ ...parsed.data, available: parsed.data.available ?? true, position: nextPosition })
    .returning();

  res.status(201).json(UpdateBeerResponse.parse(beer));
});

router.patch("/beers/reorder", requireAuth, async (req, res): Promise<void> => {
  const parsed = ReorderBeersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { beerIds } = parsed.data;
  for (let i = 0; i < beerIds.length; i++) {
    await db
      .update(beersTable)
      .set({ position: i })
      .where(eq(beersTable.id, beerIds[i]));
  }

  res.json({ success: true });
});

router.patch("/beers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateBeerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateBeerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [beer] = await db
    .update(beersTable)
    .set(parsed.data)
    .where(eq(beersTable.id, params.data.id))
    .returning();

  if (!beer) {
    res.status(404).json({ error: "Beer not found" });
    return;
  }

  res.json(UpdateBeerResponse.parse(beer));
});

router.delete("/beers/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteBeerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [beer] = await db
    .delete(beersTable)
    .where(eq(beersTable.id, params.data.id))
    .returning();

  if (!beer) {
    res.status(404).json({ error: "Beer not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
