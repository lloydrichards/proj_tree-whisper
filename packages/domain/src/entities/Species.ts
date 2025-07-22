import { faker } from "@faker-js/faker";
import { Schema } from "effect";
import {
  arrayElement,
  generateUUID,
  many,
  maybeFloatRange,
  maybeIntRange,
  maybeNull,
  maybeScientificName,
  maybeWords,
  randomPastDateTime,
} from "../helpers/mock-generators";

export const SpeciesId = Schema.UUID.pipe(Schema.brand("SpeciesId"));

// Define enums as readonly arrays for reuse
export const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;
export const MonthEnum = Schema.Literal(...MONTHS);

export const HABITS = ["TREE", "SHRUB", "VINE", "HERB"] as const;
export const HabitEnum = Schema.Literal(...HABITS);

export const RATES = ["SLOW", "MODERATE", "RAPID"] as const;
export const RateEnum = Schema.Literal(...RATES);

export class Species extends Schema.Class<Species>("Species")({
  id: SpeciesId,
  commonName: Schema.NullOr(Schema.String),
  altNames: Schema.Array(Schema.String),
  scientificName: Schema.NullOr(Schema.String),
  genus: Schema.NullOr(Schema.String),
  family: Schema.NullOr(Schema.String),
  flowerColor: Schema.Array(Schema.String),
  flowerMonths: Schema.Array(MonthEnum),
  foliageTexture: Schema.NullOr(Schema.String),
  foliageColor: Schema.Array(Schema.String),
  fruitColor: Schema.Array(Schema.String),
  fruitShape: Schema.NullOr(Schema.String),
  fruitMonths: Schema.Array(MonthEnum),
  growthForm: Schema.NullOr(Schema.String),
  growthHabit: Schema.Array(HabitEnum),
  growthRate: Schema.NullOr(RateEnum),
  growthMonths: Schema.Array(MonthEnum),
  light: Schema.NullOr(Schema.Number),
  humidity: Schema.NullOr(Schema.Number),
  soilPhMin: Schema.NullOr(Schema.Number),
  soilPhMax: Schema.NullOr(Schema.Number),
  soilNutriments: Schema.NullOr(Schema.Number),
  soilSalinity: Schema.NullOr(Schema.Number),
  soilTexture: Schema.NullOr(Schema.Number),
  soilHumidity: Schema.NullOr(Schema.Number),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.NullOr(Schema.DateTimeUtc),
}) {
  static Array = Schema.Array(this);

  static makeMock(overrides: Partial<Species> = {}): Species {
    return new Species({
      id: SpeciesId.make(generateUUID()),
      commonName: maybeWords(2),
      altNames: many(() => faker.word.words(2), 1, 3),
      scientificName: maybeScientificName(),
      genus: maybeWords(1),
      family: maybeWords(1),
      flowerColor: many(() => faker.color.human(), 1, 3),
      flowerMonths: many(() => arrayElement(MONTHS), 0, 3),
      foliageTexture: maybeNull(() =>
        arrayElement(["fine", "medium", "coarse"])
      ),
      foliageColor: many(() => faker.color.human(), 1, 3),
      fruitColor: many(() => faker.color.human(), 1, 3),
      fruitShape: maybeNull(() =>
        arrayElement(["round", "oval", "elongated", "irregular"])
      ),
      fruitMonths: many(() => arrayElement(MONTHS), 0, 3),
      growthForm: maybeNull(() =>
        arrayElement(["upright", "spreading", "weeping", "columnar"])
      ),
      growthHabit: many(() => arrayElement(HABITS), 1, 2),
      growthRate: maybeNull(() => arrayElement(RATES)),
      growthMonths: many(() => arrayElement(MONTHS), 0, 3),
      light: maybeIntRange(1, 10),
      humidity: maybeIntRange(1, 10),
      soilPhMin: maybeFloatRange(4.0, 7.0, 1),
      soilPhMax: maybeFloatRange(7.0, 9.0, 1),
      soilNutriments: maybeIntRange(1, 10),
      soilSalinity: maybeIntRange(1, 10),
      soilTexture: maybeIntRange(1, 10),
      soilHumidity: maybeIntRange(1, 10),
      createdAt: randomPastDateTime(5),
      updatedAt: null,
      ...overrides,
    });
  }
}
