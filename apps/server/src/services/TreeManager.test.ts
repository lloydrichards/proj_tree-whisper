import { it as eIt, expect } from "@effect/vitest";
import { Tree } from "@repo/domain";
import { Effect, Layer } from "effect";
import { PgContainer } from "../lib/pg-container";
import { TreeManager } from "./TreeManager";

const layer = TreeManager.DefaultWithoutDependencies.pipe(
  Layer.provide(PgContainer.Live)
);

eIt.layer(layer, { timeout: "30 seconds" })("TreeManager", (it) => {
  it.effect(
    "should create a tree",
    Effect.fnUntraced(function* () {
      const repo = yield* TreeManager;
      const mockedTree = Tree.makeMock();
      const newTree = yield* repo.create(mockedTree);

      expect(newTree).toBeDefined();
      expect(newTree.name).toBe(mockedTree.name);
    })
  );

  it.effect(
    "should find all trees",
    Effect.fnUntraced(function* () {
      const repo = yield* TreeManager;
      const mockedTree = Tree.makeMock();

      const createdTree = yield* repo.create(mockedTree);

      const trees = yield* repo.findAll();

      expect(trees.length).toBeGreaterThan(0);
      expect(trees).toContainEqual(createdTree);
    })
  );

  it.effect(
    "should find tree by id",
    Effect.fnUntraced(function* () {
      const repo = yield* TreeManager;
      const mockedTree = Tree.makeMock();

      const createdTree = yield* repo.create(mockedTree);

      const tree = yield* repo.findById(createdTree.id);

      expect(tree).toBeTruthy();
      expect(tree).toEqual(createdTree);
    })
  );

  it.effect(
    "should update a tree",
    Effect.fnUntraced(function* () {
      const repo = yield* TreeManager;
      const mockedTree = Tree.makeMock();

      const originalTree = yield* repo.create(mockedTree);

      const updatedTree = yield* repo.update({
        ...mockedTree,
        id: originalTree.id,
        name: "test-update-after",
      });

      expect(updatedTree.id).toBe(originalTree.id);
      expect(updatedTree.name).toBe("test-update-after");
    })
  );

  it.effect(
    "should delete a tree",
    Effect.fnUntraced(function* () {
      const repo = yield* TreeManager;
      const mockedTree = Tree.makeMock();

      const treeToDelete = yield* repo.create(mockedTree);

      yield* repo.del(treeToDelete.id);

      const trees = yield* repo.findAll();
      expect(trees).not.toContain(treeToDelete);
    })
  );
});
