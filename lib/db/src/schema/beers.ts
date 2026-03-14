import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const beersTable = pgTable("beers", {
  id: serial("id").primaryKey(),
  tapNumber: integer("tap_number").notNull(),
  beerName: text("beer_name").notNull(),
  brewery: text("brewery").notNull(),
  style: text("style").notNull(),
  abv: text("abv").notNull(),
  price: text("price").notNull(),
  available: boolean("available").notNull().default(true),
  position: integer("position").notNull().default(0),
});

export const insertBeerSchema = createInsertSchema(beersTable).omit({ id: true });
export type InsertBeer = z.infer<typeof insertBeerSchema>;
export type Beer = typeof beersTable.$inferSelect;
