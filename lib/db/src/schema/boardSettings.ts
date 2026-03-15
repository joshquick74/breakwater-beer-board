import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const boardSettingsTable = pgTable("board_settings", {
  id: serial("id").primaryKey(),
  headerTitle: text("header_title").notNull().default("Breakwater Barbecue"),
  googleFontHeader: text("google_font_header").notNull().default("Oswald"),
  googleFontBody: text("google_font_body").notNull().default("Open Sans"),
  accentColor: text("accent_color").notNull().default("#2d6a4f"),
  overlayEnabled: boolean("overlay_enabled").notNull().default(true),
  overlayOpacity: integer("overlay_opacity").notNull().default(60),
  textColor: text("text_color").notNull().default("#ffffff"),
  backgroundImageUrl: text("background_image_url"),
  logoImageUrl: text("logo_image_url"),
  logoSizePercent: integer("logo_size_percent").notNull().default(100),
});

export const insertBoardSettingsSchema = createInsertSchema(boardSettingsTable).omit({ id: true });
export type InsertBoardSettings = z.infer<typeof insertBoardSettingsSchema>;
export type BoardSettings = typeof boardSettingsTable.$inferSelect;
