import { fileURLToPath } from "node:url";
import { FileSystem, Path } from "@effect/platform";
import { BunContext } from "@effect/platform-bun";
import { SqlClient } from "@effect/sql";
import { PgClient } from "@effect/sql-pg";
import { pgConfig } from "@repo/database";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { Effect, Layer, Redacted } from "effect";

export class PgContainer extends Effect.Service<PgContainer>()("PgContainer", {
  scoped: Effect.acquireRelease(
    Effect.promise(() => new PostgreSqlContainer("postgres:alpine").start()),
    (container) => Effect.promise(() => container.stop())
  ),
}) {
  static readonly Live = Layer.effectDiscard(
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const sql = yield* SqlClient.SqlClient;
      const fs = yield* FileSystem.FileSystem;
      // Get the path to the database migrations
      const currentDir = fileURLToPath(new URL(".", import.meta.url));
      const schemaPath = path.join(
        currentDir,
        "../../../../packages/database/migrations/sql/_schema.sql"
      );

      const schema = yield* fs.readFileString(schemaPath);

      yield* Effect.log("🐳 Setting up PostgreSQL container...");

      yield* sql.unsafe(schema);
    })
  ).pipe(
    Layer.provideMerge(
      Layer.unwrapEffect(
        Effect.gen(function* () {
          const container = yield* PgContainer;
          return PgClient.layer({
            url: Redacted.make(container.getConnectionUri()),
            ...pgConfig,
          });
        })
      )
    ),
    Layer.provide(PgContainer.Default),
    Layer.provide(BunContext.layer),
    Layer.orDie
  );
}
