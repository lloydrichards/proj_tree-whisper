import { OpenAiClient } from "@effect/ai-openai";
import { FetchHttpClient, HttpApiBuilder, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Api, type ApiResponse } from "@repo/domain";
import { Config, Effect, Layer } from "effect";
import { SpeciesGroupLive } from "./api/Species";
import { SuggestionsGroupLive } from "./api/Suggestion";
import { TreeGroupLive } from "./api/Trees";

// Define Live API Handlers
const HealthGroupLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  handlers.handle("get", () =>
    Effect.succeed({
      message: "Health is good!",
      success: true,
    })
  )
);
const HelloGroupLive = HttpApiBuilder.group(Api, "hello", (handlers) =>
  handlers.handle("get", () => {
    const data: typeof ApiResponse.Type = {
      message: "Hello bEvr!",
      success: true,
    };
    return Effect.succeed(data);
  })
);

// Define Live API
const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(
    Layer.mergeAll(
      HealthGroupLive,
      HelloGroupLive,
      SpeciesGroupLive,
      TreeGroupLive,
      SuggestionsGroupLive
    )
  )
);

const ServerConfig = Config.all({
  port: Config.number("SERVER_PORT").pipe(Config.withDefault(9000)),
  idleTimeout: Config.number("SERVER_IDLE_TIMEOUT").pipe(
    Config.withDefault(255)
  ),
});

const MainLayer = Layer.mergeAll(
  BunHttpServer.layerConfig(ServerConfig),
  HttpApiBuilder.middlewareCors(),
  ApiLive
);

const HttpLive = HttpApiBuilder.serve().pipe(
  HttpServer.withLogAddress,
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provideMerge(MainLayer),
  // Layer.provideMerge(
  //   GoogleAiClient.layerConfig({
  //     apiKey: Config.redacted("GOOGLE_AI_API_KEY"),
  //   })
  // ),
  Layer.provideMerge(
    OpenAiClient.layerConfig({
      apiKey: Config.redacted("OPENAI_API_KEY"),
    })
  ),
  Layer.provideMerge(FetchHttpClient.layer)
);

BunRuntime.runMain(Layer.launch(HttpLive));
