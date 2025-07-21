import { it as eIt, expect } from "@effect/vitest";
import { Species } from "@repo/domain";
import { Effect, Layer } from "effect";
import { PgContainer } from "../lib/pg-container";
import { SpeciesManager } from "./SpeciesManager";

const layer = SpeciesManager.DefaultWithoutDependencies.pipe(
  Layer.provide(PgContainer.Live)
);

eIt.layer(layer, { timeout: "30 seconds" })("SpeciesManager", (it) => {
  it.effect(
    "should create a species",
    Effect.fnUntraced(function* () {
      const repo = yield* SpeciesManager;
      const mockedSpecies = Species.makeMock();
      const newSpecies = yield* repo.create(mockedSpecies);

      expect(newSpecies).toBeDefined();
      expect(newSpecies.commonName).toBe(mockedSpecies.commonName);
    })
  );

  it.effect(
    "should find all species",
    Effect.fnUntraced(function* () {
      const repo = yield* SpeciesManager;
      const species = yield* repo.findAll();

      expect(species).toBeDefined();
      expect(Array.isArray(species)).toBe(true);
    })
  );

  it.effect(
    "should find species by id",
    Effect.fnUntraced(function* () {
      const repo = yield* SpeciesManager;
      const mockedSpecies = Species.makeMock();
      const createdSpecies = yield* repo.create(mockedSpecies);
      const foundSpecies = yield* repo.findById(createdSpecies.id);

      expect(foundSpecies).toBeDefined();
      expect(foundSpecies.id).toBe(createdSpecies.id);
    })
  );
});
