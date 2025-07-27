import { HttpApi } from "@effect/platform";
import { HealthGroup } from "./Healthcheck";
import { HelloGroup } from "./Hello";
import { SpeciesGroup } from "./Species";
import { SuggestionGroup } from "./Suggestion";
import { TreesGroup } from "./Trees";

export * from "./Healthcheck";
export * from "./Hello";
export * from "./Species";
export * from "./Suggestion";
export * from "./Trees";

// Define Domain of AP

export const Api = HttpApi.make("Api")
  .add(HealthGroup)
  .add(HelloGroup)
  .add(SpeciesGroup)
  .add(TreesGroup)
  .add(SuggestionGroup);
