import { HttpApiBuilder } from "@effect/platform";
import { Api, Species } from "@repo/domain";
import { Effect, Layer, Schema } from "effect";
import { SpeciesManager } from "../services/SpeciesManager";

export const SpeciesGroupLive = HttpApiBuilder.group(
  Api,
  "species",
  (handlers) =>
    Effect.gen(function* () {
      const manager = yield* SpeciesManager;
      return handlers
        .handle("list", () => manager.findAll())
        .handle("get", ({ path: { id } }) => manager.findByName(id))
        .handle("upsert", ({ payload }) =>
          Effect.gen(function* () {
            const result = yield* manager.create(payload);
            return yield* Schema.decodeUnknown(Species)(result);
          }).pipe(
            Effect.catchTags({
              ParseError: Effect.die,
            })
          )
        )
        .handle("delete", ({ payload: { id } }) =>
          Effect.gen(function* () {
            yield* manager.del(id);
          })
        );
    })
).pipe(Layer.provide(SpeciesManager.Default));
