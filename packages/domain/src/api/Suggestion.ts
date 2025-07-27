import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform";
import { Schema } from "effect";
import { Species } from "../entities/Species";

export class SuggestionError extends Schema.TaggedError<SuggestionError>(
  "SuggestionError"
)(
  "SuggestionError",
  { cause: Schema.Unknown },
  HttpApiSchema.annotations({
    status: 404,
  })
) {
  override get message() {
    return "Suggestion not found";
  }
}

export class SuggestionGroup extends HttpApiGroup.make("suggestion")
  .add(
    HttpApiEndpoint.get("getSpecies", "/species")
      .addSuccess(Species)
      .addError(SuggestionError)
      .setUrlParams(
        Schema.Struct({
          family: Schema.String,
          genus: Schema.optional(Schema.String),
          species: Schema.optional(Schema.String),
        })
      )
  )
  .prefix("/suggestion") {}
