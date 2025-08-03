import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { trees } from "./tree";

export const species = pgTable("species", {
  scientificName: text().primaryKey(),
  commonName: text(),
  altNames: text().array(),
  genus: text(),
  family: text(),
  flowerColor: text().array(),
  flowerMonths: text().array(),
  foliageTexture: text(),
  foliageColor: text().array(),
  fruitColor: text().array(),
  fruitShape: text(),
  fruitMonths: text().array(),
  growthRate: text(),
  growthMonths: text().array(),
  light: integer(),
  humidity: integer(),
  soilPhMin: doublePrecision(),
  soilPhMax: doublePrecision(),
  soilNutriments: integer(),
  soilSalinity: integer(),
  soilTexture: integer(),
  soilHumidity: integer(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const speciesRelations = relations(species, ({ many }) => ({
  trees: many(trees),
}));
