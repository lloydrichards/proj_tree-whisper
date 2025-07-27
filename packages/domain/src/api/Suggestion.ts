import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { Species } from "../entities/Species";

export class SuggestionGroup extends HttpApiGroup.make("suggestion")
  .add(
    HttpApiEndpoint.get("getSpecies", "/species")
      .addSuccess(Species)
      .setPayload(
        Schema.Struct({
          family: Schema.String,
          genus: Schema.optional(Schema.String),
          species: Schema.optional(Schema.String),
        })
      )
  )
  .prefix("/suggestion") {}
