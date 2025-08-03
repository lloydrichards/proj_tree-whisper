import { it as eIt, expect } from "@effect/vitest";
import { UpsertSpeciesPayload } from "@repo/domain";
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
      const mockedSpecies = UpsertSpeciesPayload.makeMock();
      const newSpecies = yield* repo.create(mockedSpecies);

      expect(newSpecies).toBeDefined();
      expect(newSpecies.commonName).toBe(mockedSpecies.commonName);
    })
  );

  it.effect(
    "should find all species",
    Effect.fnUntraced(function* () {
      const repo = yield* SpeciesManager;
      const mockedSpecies = UpsertSpeciesPayload.makeMock();
      yield* repo.create(mockedSpecies);
      const species = yield* repo.findAll();

      expect(Array.isArray(species)).toBe(true);
    })
  );

  it.effect(
    "should find species by id",
    Effect.fnUntraced(function* () {
      const repo = yield* SpeciesManager;
      const mockedSpecies = UpsertSpeciesPayload.makeMock();
      const createdSpecies = yield* repo.create(mockedSpecies);

      const foundSpecies = yield* repo.findByName(
        createdSpecies.scientificName
      );

      expect(foundSpecies).toBeDefined();
      expect(foundSpecies.scientificName).toBe(createdSpecies.scientificName);
    })
  );

  it.effect(
    "should handle empty array of items in species",
    Effect.fnUntraced(function* () {
      const repo = yield* SpeciesManager;
      const mockedSpecies = UpsertSpeciesPayload.makeMock({ altNames: [] });
      const createdSpecies = yield* repo.create(mockedSpecies);
      const foundSpecies = yield* repo.findByName(
        createdSpecies.scientificName
      );

      expect(foundSpecies).toBeDefined();
      expect(foundSpecies.altNames).toHaveLength(0);
    })
  );
});
