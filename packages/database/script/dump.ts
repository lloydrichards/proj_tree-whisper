import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { Command, FileSystem } from "@effect/platform";
import { Path } from "@effect/platform/Path";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { MigrationError } from "@effect/sql/Migrator";
import { Config, Effect, pipe } from "effect";

const execAsync = promisify(exec);
const OUTPUT_FILE = "_schema.sql";

const DbConfig = Config.all({
  name: Config.string("DB_DATABASE").pipe(Config.withDefault("postgres")),
  user: Config.string("DB_USERNAME").pipe(Config.withDefault("postgres")),
  container: Config.string("DB_CONTAINER"),
});

BunRuntime.runMain(
  Effect.gen(function* () {
    const path = yield* Path;
    const fs = yield* FileSystem.FileSystem;
    const currentDir = fileURLToPath(new URL(".", import.meta.url));
    const outputPath = path.join(currentDir, "../", OUTPUT_FILE);
    const config = yield* DbConfig;

    yield* Effect.log("Dumping database schema from Docker container...");

    const pgDump = (args: string[]) =>
      Effect.gen(function* () {
        const dump = yield* pipe(
          Command.make(
            "docker",
            "exec",
            config.container,
            "pg_dump",
            ...args,
            "--no-owner",
            "--no-privileges",
            "--clean",
            "--if-exists",
            `--username=${config.user}`,
            `--dbname=${config.name}`
          ),
          Command.string
        );

        return dump
          .replace(/^--.*$/gm, "")
          .replace(/^SET .*$/gm, "")
          .replace(/^SELECT pg_catalog\..*$/gm, "")
          .replace(/\n{2,}/gm, "\n\n")
          .trim();
      }).pipe(
        Effect.mapError(
          (error) =>
            new MigrationError({
              reason: "failed",
              message: error.message,
            })
        )
      );

    // Check if the container is running
    yield* Effect.tryPromise({
      try: async () => {
        const { stdout } = await execAsync(
          `docker ps --filter name=${config.container} --format "{{.Names}}"`
        );
        if (!stdout.includes(config.container)) {
          throw new Error(
            `Container ${config.container} is not running. Please start the database container first.`
          );
        }
        return stdout;
      },
      catch: (error) =>
        new Error(`Failed to check container status: ${String(error)}`),
    });

    yield* Effect.log(
      `Connecting to database: ${config.name} as user: ${config.user}`
    );

    // Dump the schema using pg_dump
    const pgDumpSchema = yield* pgDump(["--schema-only"]);

    const pgDumpMigrations = yield* pgDump([
      "--column-inserts",
      "--data-only",
      // `--table=${table}`,
    ]);

    const pgDumpAll = `${pgDumpSchema}\n\n${pgDumpMigrations}`;

    // Write the schema to the output file
    yield* fs.writeFile(outputPath, new TextEncoder().encode(pgDumpAll));

    yield* Effect.log(
      `✅ Database schema successfully dumped to: ${outputPath}`
    );
  }).pipe(Effect.provide([BunContext.layer]))
);
