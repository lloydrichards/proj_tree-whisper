import { Schema } from "effect";
import {
  generateUUID,
  maybeArrayElement,
  maybeFloatRange,
  maybeIntRange,
  maybeScientificName,
  maybeWords,
  randomPastDateTime,
} from "../helpers/mock-generators";

export const SpeciesId = Schema.UUID.pipe(Schema.brand("SpeciesId"));

// Define enums based on the schema provided
export const MonthEnum = Schema.Literal(
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER"
);

export const HabitEnum = Schema.Literal(
  "SHRUB",
  "TREE",
  "VINE",
  "HERBACEOUS",
  "GRASS"
);

export const RateEnum = Schema.Literal("SLOW", "MODERATE", "FAST");

export class Species extends Schema.Class<Species>("Species")({
  id: SpeciesId,
  commonName: Schema.NullOr(Schema.String),
  scientificName: Schema.NullOr(Schema.String),
  genus: Schema.NullOr(Schema.String),
  family: Schema.NullOr(Schema.String),
  foliageTexture: Schema.NullOr(Schema.String),
  fruitShape: Schema.NullOr(Schema.String),
  growthForm: Schema.NullOr(Schema.String),
  growthRate: Schema.NullOr(RateEnum),
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
      scientificName: maybeScientificName(),
      genus: maybeWords(1),
      family: maybeWords(1),
      foliageTexture: maybeArrayElement(["fine", "medium", "coarse"]),
      fruitShape: maybeArrayElement([
        "round",
        "oval",
        "elongated",
        "irregular",
      ]),
      growthForm: maybeArrayElement([
        "upright",
        "spreading",
        "weeping",
        "columnar",
      ]),
      growthRate: maybeArrayElement(["SLOW", "MODERATE", "FAST"] as const),
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
