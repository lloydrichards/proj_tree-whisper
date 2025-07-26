import { FileSystem } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { SqlClient } from "@effect/sql";
import type { Fragment, Primitive } from "@effect/sql/Statement";
import { Array, Effect, Schema } from "effect";
import { PgLive } from "../src/index";

const TreeSeed = Schema.Struct({
  name: Schema.String,
  number: Schema.String,
  category: Schema.Literal("STREET", "PARK"),
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
  common_name: Schema.NullOr(Schema.String),
  alt_names: Schema.optional(Schema.Array(Schema.String)),
  scientific_name: Schema.NullOr(Schema.String),
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
  const sql = yield* SqlClient.SqlClient;
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("Seeding trees...");

  const content = yield* fs
    .readFileString("./script/data/tree_seed.json")
    .pipe(Effect.map((s) => JSON.parse(s)));

  const trees = yield* Schema.decodeUnknown(Schema.Array(TreeSeed))(content);

  const chunks = Array.chunksOf(trees, 500);

  yield* Effect.log(
    `Inserting ${trees.length} trees in ${chunks.length} chunks...`
  );

  for (const chunk of chunks) {
    yield* sql`INSERT INTO trees ${sql.insert(chunk)}`;
  }
});
const seedSpeccies = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const fs = yield* FileSystem.FileSystem;

  yield* Effect.log("Seeding species...");

  const content = yield* fs
    .readFileString("./script/data/species_seed.json")
    .pipe(Effect.map((s) => JSON.parse(s)));

  const species = yield* Schema.decodeUnknown(Schema.Array(SpeciesSeed))(
    content
  );

  const chunks = Array.chunksOf(species, 500);

  yield* Effect.log(
    `Inserting ${species.length} species in ${chunks.length} chunks...`
  );

  for (const chunk of chunks) {
    yield* sql`INSERT INTO species ${sql.insert(
      chunk as unknown as Record<string, Primitive | Fragment | undefined>
    )}`;
  }
});

BunRuntime.runMain(
  Effect.gen(function* () {
    yield* Effect.log("Starting seed...");

    yield* seedTrees;
    yield* seedSpeccies;

    yield* Effect.log("Seed complete");
  }).pipe(Effect.provide(PgLive), Effect.provide(BunContext.layer))
);
