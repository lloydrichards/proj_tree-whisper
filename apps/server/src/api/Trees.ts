import { HttpApiBuilder } from "@effect/platform";
import { Api, Tree, TreeId } from "@repo/domain";
import { DateTime, Effect } from "effect";

const getTrees = Effect.succeed([]);
const getTree = (id: typeof TreeId.Type) =>
  Effect.succeed(
    new Tree({
      id,
      name: "Sample Tree",
      number: "123",
      category: "STREET",
      quarter: "North",
      address: "123 Tree Lane",
      family: "Oak",
      species: "Quercus",
      cultivar: "Northern Red Oak",
      year: 2020,
      longitude: -123.456,
      latitude: 45.678,
      createdAt: DateTime.unsafeFromDate(new Date()),
      updatedAt: null,
    })
  );

export const TreeGroupLive = HttpApiBuilder.group(Api, "trees", (handlers) =>
  handlers
    .handle("list", () => getTrees)
    .handle("get", ({ path: { id } }) => getTree(id))
    .handle("upsert", () =>
      getTree(TreeId.make("123e4567-e89b-12d3-a456-426614174000"))
    )
    .handle("delete", () => Effect.void)
);
