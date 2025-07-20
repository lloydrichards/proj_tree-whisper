import { HttpApiBuilder } from "@effect/platform";
import { Api } from "@repo/domain";
import { Effect } from "effect";
import { TreeManager } from "../services/TreeManager";

export const TreeGroupLive = HttpApiBuilder.group(Api, "trees", (handlers) =>
  Effect.gen(function* () {
    const manager = yield* TreeManager;
    return handlers
      .handle("list", () => manager.findAll())
      .handle("get", ({ path: { id } }) => manager.findById(id))
      .handle("upsert", ({ payload }) =>
        payload.id
          ? manager.update(
              payload as typeof payload & { id: NonNullable<typeof payload.id> }
            )
          : manager.create(payload)
      )

      .handle("delete", () => Effect.void);
  })
);
