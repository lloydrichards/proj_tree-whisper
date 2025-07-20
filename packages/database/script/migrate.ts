import { fileURLToPath } from "node:url";
import { Path } from "@effect/platform/Path";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { PgMigrator } from "@effect/sql-pg";
import { Effect } from "effect";
import { PgLive } from "../src/index";

BunRuntime.runMain(
  Effect.gen(function* () {
    const path = yield* Path;

    const currentDir = fileURLToPath(new URL(".", import.meta.url));

    const migrations = yield* PgMigrator.run({
      loader: PgMigrator.fromFileSystem(path.join(currentDir, "../migrations")),
      schemaDirectory: path.join(currentDir, "../migrations/sql"),
    });

    if (migrations.length === 0) {
      yield* Effect.log("No new migrations to run.");
    } else {
      yield* Effect.log("Migrations applied:");
      for (const [id, name] of migrations) {
        yield* Effect.log(`- ${id.toString().padStart(4, "0")}_${name}`);
      }
    }
  }).pipe(Effect.provide([BunContext.layer, PgLive]))
);
