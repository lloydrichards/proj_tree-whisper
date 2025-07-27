import { AiLanguageModel } from "@effect/ai";
import { OpenAiLanguageModel } from "@effect/ai-openai";
import { HttpApiBuilder } from "@effect/platform";
import { Api, Species, SuggestionError } from "@repo/domain";
import { Effect, Layer, Schema } from "effect";

// const GeminiModel = GoogleAiLanguageModel.model("gemini-2.5-flash");
const OpenAIModel = OpenAiLanguageModel.model("o4-mini");

export const SuggestionsGroupLive = HttpApiBuilder.group(
  Api,
  "suggestion",
  (handlers) =>
    Effect.gen(function* () {
      return handlers.handle("getSpecies", ({ urlParams }) =>
        Effect.gen(function* () {
          yield* Effect.log("Generating species suggestion...");
          const response = yield* AiLanguageModel.generateObject({
            system:
              "You are an expert in plant species. Provide detailed suggestions based on the given criteria.",
            prompt: `Suggest species based on the following criteria: ${JSON.stringify(
              urlParams
            )}`,
            schema: Species.pipe(Schema.omit("createdAt", "updatedAt")),
          });

          return response.value;
        }).pipe(
          Effect.catchAll((error) => new SuggestionError({ cause: error }))
        )
      );
    })
).pipe(Layer.provide(OpenAIModel));
