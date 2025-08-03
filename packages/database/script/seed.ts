import { FileSystem } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Array, Effect, Schema, Struct } from "effect";
import { Database, DrizzleLive, PgLive } from "../src/index";
import { species, trees } from "../src/schema";

const TreeSeed = Schema.Struct({
  name: Schema.String,
  number: Schema.String,
  category: Schema.String,
  quarter: Schema.String,
  address: Schema.NullOr(Schema.String),
  family: Schema.String,
  species: Schema.String,
  cultivar: Schema.NullOr(Schema.String),
  year: Schema.NullOr(Schema.Number),
  longitude: Schema.Number,
  latitude: Schema.Number,
});

const SpeciesSeed = Schema.Struct({
  id: Schema.String,
  scientific_name: Schema.String,
  common_name: Schema.NullOr(Schema.String),
  alt_names: Schema.optional(Schema.Array(Schema.String)),
  genus: Schema.NullOr(Schema.String),
  family: Schema.NullOr(Schema.String),
  flower_color: Schema.Array(Schema.String),
  flower_months: Schema.Array(Schema.String),
  foliage_texture: Schema.NullOr(Schema.String),
  foliage_color: Schema.Array(Schema.String),
  fruit_color: Schema.Array(Schema.String),
  fruit_shape: Schema.NullOr(Schema.String),
  fruit_months: Schema.Array(Schema.String),
  growth_form: Schema.NullOr(Schema.String),
  growth_habit: Schema.Array(Schema.String),
  growth_rate: Schema.optional(Schema.NullOr(Schema.String)),
  growth_months: Schema.Array(Schema.String),
  light: Schema.NullOr(Schema.Number),
  humidity: Schema.NullOr(Schema.Number),
  soil_ph_min: Schema.NullOr(Schema.Number),
  soil_ph_max: Schema.NullOr(Schema.Number),
  soil_nutriments: Schema.NullOr(Schema.Number),
  soil_salinity: Schema.NullOr(Schema.Number),
  soil_texture: Schema.NullOr(Schema.Number),
  soil_humidity: Schema.NullOr(Schema.Number),
});

const seedTrees = Effect.gen(function* () {
  const db = yield* Database;
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("Seeding trees...");

  const content = yield* fs
    .readFileString("./script/data/tree_seed.json")
    .pipe(Effect.map((s) => JSON.parse(s)));

  const treeSeed = yield* Schema.decodeUnknown(Schema.Array(TreeSeed))(content);

  const chunks = Array.chunksOf(treeSeed, 500);

  yield* Effect.log(
    `Inserting ${treeSeed.length} trees in ${chunks.length} chunks...`
  );

  for (const chunk of chunks) {
    yield* db.insert(trees).values(
      chunk.map((d) => ({
        id: d.number,
        name: d.name,
        category: d.category,
        quarter: d.quarter,
        address: d.address,
        family: d.family,
        species: d.species,
        cultivar: d.cultivar,
        year: d.year,
        longitude: d.longitude,
        latitude: d.latitude,
      }))
    );
  }
});
const seedSpeccies = Effect.gen(function* () {
  const db = yield* Database;
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("Seeding species...");

  const content = yield* fs
    .readFileString("./script/data/species_seed.json")
    .pipe(Effect.map((s) => JSON.parse(s)));

  const speciesSeed = yield* Schema.decodeUnknown(Schema.Array(SpeciesSeed))(
    content
  );

  const cleanedSpecies = speciesSeed
    .map((s) => ({
      ...s,
      id: undefined,
      scientific_name: s.id,
    }))
    .map(Struct.omit("id"));

  const chunks = Array.chunksOf(cleanedSpecies, 500);

  yield* Effect.log(
    `Inserting ${cleanedSpecies.length} species in ${chunks.length} chunks...`
  );

  for (const chunk of chunks) {
    yield* db.insert(species).values(
      chunk.map((d) => ({
        scientificName: d.scientific_name,
        commonName: d.common_name,
        altNames: d.alt_names?.map((e) => e),
        genus: d.genus,
        family: d.family,
        flowerColor: d.flower_color?.map((e) => e),
        flowerMonths: d.flower_months?.map((e) => e),
        foliageTexture: d.foliage_texture,
        foliageColor: d.foliage_color?.map((e) => e),
        fruitColor: d.fruit_color?.map((e) => e),
        fruitShape: d.fruit_shape,
        fruitMonths: d.fruit_months?.map((e) => e),
        growthRate: d.growth_rate,
        growthMonths: d.growth_months?.map((e) => e),
        light: d.light,
        humidity: d.humidity,
        soilPhMin: d.soil_ph_min,
        soilPhMax: d.soil_ph_max,
        soilNutriments: d.soil_nutriments,
        soilSalinity: d.soil_salinity,
        soilTexture: d.soil_texture,
        soilHumidity: d.humidity,
      }))
    );
  }
});

BunRuntime.runMain(
  Effect.gen(function* () {
    yield* Effect.log("Starting seed...");

    yield* seedSpeccies;
    yield* seedTrees;

    yield* Effect.log("Seed complete");
  }).pipe(
    Effect.provide(DrizzleLive),
    Effect.provide(PgLive),
    Effect.provide(BunContext.layer)
  )
);
