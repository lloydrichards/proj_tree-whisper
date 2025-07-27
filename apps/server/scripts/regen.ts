import { AiLanguageModel } from "@effect/ai";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai";
import { FetchHttpClient } from "@effect/platform";
import { BunRuntime } from "@effect/platform-bun";
import { SqlClient } from "@effect/sql";
import type { Fragment, Primitive } from "@effect/sql/Statement";
import { PgLive } from "@repo/database";
import { Species } from "@repo/domain";
import { Config, Effect, Either, RateLimiter, Schema } from "effect";
import { SpeciesManager } from "../src/services/SpeciesManager";

const getSuggestion = (opt: {
  scientificName: string;
  commonName: string | null;
  family: string | null;
  genus: string | null;
}) =>
  Effect.gen(function* () {
    yield* Effect.log(
      `Generating species suggestion for ${opt.scientificName}...`
    );
    const response = yield* AiLanguageModel.generateObject({
      system: "You are an expert in plant species.",
      prompt:
        `Suggest species based on the following criteria: ${JSON.stringify(
          opt
        )}` +
        "When generating colors try to be as accurate as possible and not use generic colors like green and use hex values" +
        "When generating common names, only use names that are commonly used in the English language.",
      schema: Species.pipe(Schema.omit("createdAt", "updatedAt")),
    });

    return response.value;
  });

const regenSpecies = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const manager = yield* SpeciesManager;
  const rateLimiter = yield* RateLimiter.make({
    limit: 1,
    interval: "1 second",
  });

  yield* Effect.log("Getting all species...");
  const species = yield* manager.findAll();

  yield* Effect.all(
    species.map((cur) =>
      rateLimiter(
        Effect.gen(function* () {
          const newSpecies = yield* getSuggestion({
            scientificName: cur.scientificName,
            commonName: cur.commonName,
            family: cur.family,
            genus: cur.genus,
          }).pipe(
            Effect.catchAll((error) =>
              Effect.gen(function* () {
                yield* Effect.logError(
                  `Error generating species suggestion for ${cur.scientificName}`
                );
                yield* Effect.logError(error);

                return Effect.succeed(cur);
              })
            )
          );

          const guard = Schema.decodeUnknownEither(
            Species.pipe(Schema.omit("createdAt", "updatedAt"))
          )(newSpecies);

          if (Either.isLeft(guard)) {
            yield* Effect.logError(
              `Invalid species suggestion for ${
                cur.scientificName
              }: ${JSON.stringify(guard.left)}`
            );
            return;
          }

          const chunk = {
            ...newSpecies,
            scientificName: cur.scientificName,
          };

          yield* sql`
      INSERT INTO species ${sql.insert(
        chunk as unknown as Record<string, Primitive | Fragment | undefined>
      )}
      ON CONFLICT (scientific_name)
      DO UPDATE SET
      common_name = EXCLUDED.common_name,
      family = EXCLUDED.family,
      genus = EXCLUDED.genus
    `;
        })
      )
    ),
    { concurrency: 1 }
  );
});
const OpenAIModel = OpenAiLanguageModel.model("gpt-4o");

BunRuntime.runMain(
  Effect.gen(function* () {
    yield* Effect.log("Starting regenerating...");

    yield* regenSpecies.pipe(Effect.scoped);

    yield* Effect.log("Regenerating complete");
  }).pipe(
    Effect.provide(PgLive),
    Effect.provide(OpenAIModel),
    Effect.provide(SpeciesManager.Default),
    Effect.provide(
      OpenAiClient.layerConfig({
        apiKey: Config.redacted("OPENAI_API_KEY"),
      })
    ),
    Effect.provide(FetchHttpClient.layer)
  )
);
