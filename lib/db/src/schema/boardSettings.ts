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
  breweryFont: text("brewery_font").notNull().default("Open Sans"),
  breweryColor: text("brewery_color").notNull().default("#ffffff"),
  beerNameFont: text("beer_name_font").notNull().default("Open Sans"),
  beerNameColor: text("beer_name_color").notNull().default("#ffffff"),
  styleFont: text("style_font").notNull().default("Open Sans"),
  styleColor: text("style_color").notNull().default("#ffffff"),
  abvFont: text("abv_font").notNull().default("Open Sans"),
  abvColor: text("abv_color").notNull().default("#ffffff"),
  priceFont: text("price_font").notNull().default("Open Sans"),
  priceColor: text("price_color").notNull().default("#ffffff"),
  boardRotation: integer("board_rotation").notNull().default(270),
});

export const insertBoardSettingsSchema = createInsertSchema(boardSettingsTable).omit({ id: true });
export type InsertBoardSettings = z.infer<typeof insertBoardSettingsSchema>;
export type BoardSettings = typeof boardSettingsTable.$inferSelect;
