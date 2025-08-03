import { faker } from "@faker-js/faker";
import { Schema } from "effect";
import {
  arrayElement,
  many,
  maybeFloatRange,
  maybeIntRange,
  maybeNull,
  maybeWords,
  randomPastDateTime,
} from "../helpers/mock-generators";

// Forward declaration to avoid circular dependency
export type UpsertSpeciesPayload =
  import("../api/Species").UpsertSpeciesPayload;

export const SpeciesId = Schema.String.annotations({
  description:
    "Unique identifier for the species, represented by the scientific name of the species",
}).pipe(Schema.brand("SpeciesId"));

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
export const MonthEnum = Schema.Literal(...MONTHS).annotations({
  description: "Months of the year, represented as three-letter abbreviations",
});

export const HABITS = ["TREE", "SHRUB", "VINE", "HERB"] as const;
export const HabitEnum = Schema.Literal(...HABITS).annotations({
  description:
    "Growth habits of the species, such as tree, shrub, vine, or herb",
});

export const RATES = ["SLOW", "MODERATE", "RAPID"] as const;
export const RateEnum = Schema.Literal(...RATES).annotations({
  description: "Growth rates of the species, such as slow, moderate, or rapid",
});

export class Species extends Schema.Class<Species>("Species")({
  scientificName: SpeciesId,
  commonName: Schema.NullOr(Schema.String).annotations({
    description: "Common name of the species",
  }),
  altNames: Schema.NullOr(
    Schema.Array(Schema.String).annotations({
      description: "Alternative names for the species",
    })
  ),
  genus: Schema.NullOr(Schema.String),
  family: Schema.NullOr(Schema.String),
  flowerColor: Schema.Array(
    Schema.String.annotations({
      description:
        "Colors of the flowers of the species, represented as hex codes",
    })
  ),
  flowerMonths: Schema.Array(MonthEnum),
  foliageTexture: Schema.NullOr(
    Schema.String.annotations({
      description: "Texture of the foliage, such as fine, medium, or coarse",
    })
  ),
  foliageColor: Schema.Array(
    Schema.String.annotations({
      description:
        "Colors of the foliage of the species, represented as hex codes",
    })
  ),
  fruitColor: Schema.Array(
    Schema.String.annotations({
      description:
        "Colors of the fruit of the species, represented as hex codes",
    })
  ),
  fruitShape: Schema.NullOr(
    Schema.String.annotations({
      description: "Shape of the fruit, such as round or elongated",
    })
  ),
  fruitMonths: Schema.Array(MonthEnum),
  growthForm: Schema.NullOr(
    Schema.String.annotations({
      description: "Growth form of the species, such as upright or spreading",
    })
  ),
  growthHabit: Schema.Array(HabitEnum),
  growthRate: Schema.NullOr(RateEnum),
  growthMonths: Schema.Array(MonthEnum),
  light: Schema.NullOr(
    Schema.Number.annotations({
      description: "Light requirements on a scale from 1 to 10",
    })
  ),
  humidity: Schema.NullOr(
    Schema.Number.annotations({
      description: "Humidity requirements on a scale from 1 to 10",
    })
  ),
  soilPhMin: Schema.NullOr(
    Schema.Number.annotations({
      description: "Minimum soil pH level for the species",
    })
  ),
  soilPhMax: Schema.NullOr(
    Schema.Number.annotations({
      description: "Maximum soil pH level for the species",
    })
  ),
  soilNutriments: Schema.NullOr(
    Schema.Number.annotations({
      description: "Nutrient requirements on a scale from 1 to 10",
    })
  ),
  soilSalinity: Schema.NullOr(
    Schema.Number.annotations({
      description: "Salinity tolerance on a scale from 1 to 10",
    })
  ),
  soilTexture: Schema.NullOr(
    Schema.Number.annotations({
      description: "Soil texture preference on a scale from 1 to 10",
    })
  ),
  soilHumidity: Schema.NullOr(
    Schema.Number.annotations({
      description: "Soil humidity preference on a scale from 1 to 10",
    })
  ),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.NullOr(Schema.DateTimeUtc),
}) {
  static Array = Schema.Array(this);

  static makeMock(overrides: Partial<Species> = {}): Species {
    return new Species({
      scientificName: SpeciesId.make(
        `${faker.word.words(1)} ${faker.word.words(1)}`
      ),
      commonName: maybeWords(2),
      altNames: many(() => faker.word.words(2), 1, 3),
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

  static makeMockInsert(
    overrides: Partial<UpsertSpeciesPayload> = {}
  ): UpsertSpeciesPayload {
    return {
      scientificName: SpeciesId.make(
        `${faker.word.words(1)} ${faker.word.words(1)}`
      ),
      commonName: maybeWords(2),
      altNames: many(() => faker.word.words(2), 1, 3),
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
      soilPhMin: maybeFloatRange(0.0, 14.0, 1),
      soilPhMax: maybeFloatRange(0.0, 14.0, 1),
      soilNutriments: maybeIntRange(1, 10),
      soilSalinity: maybeIntRange(1, 10),
      soilTexture: maybeIntRange(1, 10),
      soilHumidity: maybeIntRange(1, 10),
      ...overrides,
    };
  }
}
