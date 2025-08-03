import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform";
import { Schema } from "effect";
import {
  HabitEnum,
  MonthEnum,
  RateEnum,
  Species,
  SpeciesId,
} from "../entities/Species";

export class UpsertSpeciesPayload extends Schema.Class<UpsertSpeciesPayload>(
  "UpsertSpeciesPayload"
)({
  scientificName: SpeciesId.pipe(
    Schema.nonEmptyString({
      message: () => "Scientific name must not be empty",
    }),
    Schema.maxLength(255, {
      message: () => "Scientific name must be at most 255 characters long",
    })
  ),
  commonName: Schema.NullOr(
    Schema.Trim.pipe(
      Schema.nonEmptyString({
        message: () => "Common name must not be empty",
      }),
      Schema.maxLength(255, {
        message: () => "Common name must be at most 255 characters long",
      })
    )
  ),
  altNames: Schema.mutable(Schema.Array(Schema.String)),
  genus: Schema.NullOr(
    Schema.Trim.pipe(
      Schema.nonEmptyString({
        message: () => "Genus must not be empty",
      }),
      Schema.maxLength(100, {
        message: () => "Genus must be at most 100 characters long",
      })
    )
  ),
  family: Schema.NullOr(
    Schema.Trim.pipe(
      Schema.nonEmptyString({
        message: () => "Family must not be empty",
      }),
      Schema.maxLength(100, {
        message: () => "Family must be at most 100 characters long",
      })
    )
  ),
  flowerColor: Schema.mutable(Schema.Array(Schema.String)),
  flowerMonths: Schema.mutable(Schema.Array(MonthEnum)),
  foliageTexture: Schema.NullOr(Schema.String),
  foliageColor: Schema.mutable(Schema.Array(Schema.String)),
  fruitColor: Schema.mutable(Schema.Array(Schema.String)),
  fruitShape: Schema.NullOr(Schema.String),
  fruitMonths: Schema.mutable(Schema.Array(MonthEnum)),
  growthForm: Schema.NullOr(Schema.String),
  growthHabit: Schema.mutable(Schema.Array(HabitEnum)),
  growthRate: Schema.NullOr(RateEnum),
  growthMonths: Schema.mutable(Schema.Array(MonthEnum)),
  light: Schema.NullOr(
    Schema.Number.pipe(
      Schema.int({
        message: () => "Light must be an integer",
      }),
      Schema.greaterThanOrEqualTo(1, {
        message: () => "Light must be between 1 and 10",
      }),
      Schema.lessThanOrEqualTo(10, {
        message: () => "Light must be between 1 and 10",
      })
    )
  ),
  humidity: Schema.NullOr(
    Schema.Number.pipe(
      Schema.int({
        message: () => "Humidity must be an integer",
      }),
      Schema.greaterThanOrEqualTo(1, {
        message: () => "Humidity must be between 1 and 10",
      }),
      Schema.lessThanOrEqualTo(10, {
        message: () => "Humidity must be between 1 and 10",
      })
    )
  ),
  soilPhMin: Schema.NullOr(
    Schema.Number.pipe(
      Schema.greaterThanOrEqualTo(0, {
        message: () => "Soil pH min must be between 0 and 14",
      }),
      Schema.lessThanOrEqualTo(14, {
        message: () => "Soil pH min must be between 0 and 14",
      })
    )
  ),
  soilPhMax: Schema.NullOr(
    Schema.Number.pipe(
      Schema.greaterThanOrEqualTo(0, {
        message: () => "Soil pH max must be between 0 and 14",
      }),
      Schema.lessThanOrEqualTo(14, {
        message: () => "Soil pH max must be between 0 and 14",
      })
    )
  ),
  soilNutriments: Schema.NullOr(
    Schema.Number.pipe(
      Schema.int({
        message: () => "Soil nutriments must be an integer",
      }),
      Schema.greaterThanOrEqualTo(1, {
        message: () => "Soil nutriments must be between 1 and 10",
      }),
      Schema.lessThanOrEqualTo(10, {
        message: () => "Soil nutriments must be between 1 and 10",
      })
    )
  ),
  soilSalinity: Schema.NullOr(
    Schema.Number.pipe(
      Schema.int({
        message: () => "Soil salinity must be an integer",
      }),
      Schema.greaterThanOrEqualTo(1, {
        message: () => "Soil salinity must be between 1 and 10",
      }),
      Schema.lessThanOrEqualTo(10, {
        message: () => "Soil salinity must be between 1 and 10",
      })
    )
  ),
  soilTexture: Schema.NullOr(
    Schema.Number.pipe(
      Schema.int({
        message: () => "Soil texture must be an integer",
      }),
      Schema.greaterThanOrEqualTo(1, {
        message: () => "Soil texture must be between 1 and 10",
      }),
      Schema.lessThanOrEqualTo(10, {
        message: () => "Soil texture must be between 1 and 10",
      })
    )
  ),
  soilHumidity: Schema.NullOr(
    Schema.Number.pipe(
      Schema.int({
        message: () => "Soil humidity must be an integer",
      }),
      Schema.greaterThanOrEqualTo(1, {
        message: () => "Soil humidity must be between 1 and 10",
      }),
      Schema.lessThanOrEqualTo(10, {
        message: () => "Soil humidity must be between 1 and 10",
      })
    )
  ),
}) {}

export class SpeciesNotFoundError extends Schema.TaggedError<SpeciesNotFoundError>(
  "SpeciesNotFoundError"
)(
  "SpeciesNotFoundError",
  { id: SpeciesId },
  HttpApiSchema.annotations({
    status: 404,
  })
) {
  override get message() {
    return `Species with id ${this.id} not found`;
  }
}

export class NoSpeciesFoundError extends Schema.TaggedError<NoSpeciesFoundError>(
  "NoSpeciesFoundError"
)(
  "NoSpeciesFoundError",
  {},
  HttpApiSchema.annotations({
    status: 404,
  })
) {
  override get message() {
    return "No species found";
  }
}

export class SpeciesGroup extends HttpApiGroup.make("species")
  .add(HttpApiEndpoint.get("list", "/").addSuccess(Species.Array))
  .add(
    HttpApiEndpoint.put("upsert", "/")
      .addSuccess(Species)
      .addError(SpeciesNotFoundError)
      .setPayload(UpsertSpeciesPayload)
  )
  .add(
    HttpApiEndpoint.get("get", "/:id")
      .addSuccess(Species)
      .addError(SpeciesNotFoundError)
      .setPath(
        Schema.Struct({
          id: SpeciesId,
        })
      )
  )
  .add(
    HttpApiEndpoint.get("find", "/find")
      .addSuccess(Species.Array)
      .addError(SpeciesNotFoundError)
      .setUrlParams(
        Schema.Struct({
          q: Schema.String,
        })
      )
  )
  .add(
    HttpApiEndpoint.del("delete", "/")
      .setPayload(
        Schema.Struct({
          id: SpeciesId,
        })
      )
      .addSuccess(Schema.Void)
      .addError(SpeciesNotFoundError)
  )
  .prefix("/species") {}
