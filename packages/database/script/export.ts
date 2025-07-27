import { FileSystem } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { SqlClient } from "@effect/sql";
import { Console, Effect } from "effect";
import { PgLive } from "../src/index";

BunRuntime.runMain(
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    const fs = yield* FileSystem.FileSystem;

    const allSpecies = yield* sql`
      SELECT
        * 
      FROM
        species`;

    // const allTrees = yield* sql`
    //   SELECT
    //     *
    //   FROM
    //     trees`;

    // write species to file
    yield* Console.log(`Writing ${allSpecies.length} species to file...`);
    yield* fs.writeFileString(
      "./script/data/species_backup.json",
      JSON.stringify(allSpecies, null, 2)
    );

    // write trees to file
    // yield* Console.log(`Writing ${allTrees.length} trees to file...`);
    // yield* fs.writeFileString(
    //   "./script/data/trees_backup.json",
    //   JSON.stringify(allTrees, null, 2)
    // );
  }).pipe(Effect.provide(PgLive), Effect.provide(BunContext.layer))
);
