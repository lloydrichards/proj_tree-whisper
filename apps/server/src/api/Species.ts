import { HttpApiBuilder } from "@effect/platform";
import { Api } from "@repo/domain";
import { Effect, Layer } from "effect";
import { SpeciesManager } from "../services/SpeciesManager";

export const SpeciesGroupLive = HttpApiBuilder.group(
  Api,
  "species",
  (handlers) =>
    Effect.gen(function* () {
      const manager = yield* SpeciesManager;
      return handlers
        .handle("list", () => manager.findAll())
        .handle("get", ({ path: { id } }) => manager.findById(id))
        .handle("upsert", ({ payload }) =>
          payload.id
            ? manager.update(
                payload as typeof payload & {
                  id: NonNullable<typeof payload.id>;
                }
              )
            : manager.create(payload)
        )
        .handle("delete", ({ payload: { id } }) => manager.del(id));
    })
).pipe(Layer.provide(SpeciesManager.Default));
