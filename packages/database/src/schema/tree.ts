import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { species } from "./species";

export const trees = pgTable("trees", {
  id: text().primaryKey(),
  name: text().notNull(),
  category: text().notNull(),
  quarter: text().notNull(),
  address: text(),
  family: text().notNull(),
  species: text().notNull(),
  cultivar: text(),
  year: integer(),
  longitude: doublePrecision().notNull(),
  latitude: doublePrecision().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: timestamp({ withTimezone: true }),
});

export const treeRelations = relations(trees, ({ one }) => ({
  species: one(species, {
    fields: [trees.species],
    references: [species.scientificName],
  }),
}));
