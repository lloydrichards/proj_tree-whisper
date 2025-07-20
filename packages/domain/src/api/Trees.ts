import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform";
import { Schema } from "effect";
import { Tree, TreeId } from "../entities/Tree";

export class UpsertTreePayload extends Schema.Class<UpsertTreePayload>(
  "UpsertTreePayload"
)({
  id: Schema.optional(TreeId),
  name: Schema.Trim.pipe(
    Schema.nonEmptyString({
      message: () => "Name is required",
    }),
    Schema.maxLength(100, {
      message: () => "Name must be at most 100 characters long",
    })
  ),
  number: Schema.Trim.pipe(
    Schema.nonEmptyString({
      message: () => "Number is required",
    }),
    Schema.maxLength(50, {
      message: () => "Number must be at most 50 characters long",
    })
  ),
  category: Schema.Literal("STREET", "PARK"),
  quarter: Schema.Trim.pipe(
    Schema.nonEmptyString({
      message: () => "Quarter is required",
    }),
    Schema.maxLength(100, {
      message: () => "Quarter must be at most 100 characters long",
    })
  ),
  address: Schema.Trim.pipe(
    Schema.nonEmptyString({
      message: () => "Address is required",
    }),
    Schema.maxLength(200, {
      message: () => "Address must be at most 200 characters long",
    })
  ),
  family: Schema.Trim.pipe(
    Schema.nonEmptyString({
      message: () => "Family is required",
    }),
    Schema.maxLength(100, {
      message: () => "Family must be at most 100 characters long",
    })
  ),
  species: Schema.Trim.pipe(
    Schema.nonEmptyString({
      message: () => "Species is required",
    }),
    Schema.maxLength(100, {
      message: () => "Species must be at most 100 characters long",
    })
  ),
  cultivar: Schema.Trim.pipe(
    Schema.nonEmptyString({
      message: () => "Cultivar is required",
    }),
    Schema.maxLength(100, {
      message: () => "Cultivar must be at most 100 characters long",
    })
  ),
  year: Schema.Number.pipe(
    Schema.int({
      message: () => "Year must be an integer",
    }),
    Schema.greaterThanOrEqualTo(0, {
      message: () => "Year must be in this millennium (>= 0)",
    }),
    Schema.lessThanOrEqualTo(new Date().getFullYear(), {
      message: () => "Year cannot be in the future",
    })
  ),
  longitude: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(-180, {
      message: () => "Longitude must be between -180 and 180",
    }),
    Schema.lessThanOrEqualTo(180, {
      message: () => "Longitude must be between -180 and 180",
    })
  ),
  latitude: Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(-90, {
      message: () => "Latitude must be between -90 and 90",
    }),
    Schema.lessThanOrEqualTo(90, {
      message: () => "Latitude must be between -90 and 90",
    })
  ),
}) {}

export class TreeNotFoundError extends Schema.TaggedError<TreeNotFoundError>(
  "TreeNotFoundError"
)(
  "TreeNotFoundError",
  { id: TreeId },
  HttpApiSchema.annotations({
    status: 404,
  })
) {
  override get message() {
    return `Tree with id ${this.id} not found`;
  }
}

export class TreesGroup extends HttpApiGroup.make("trees")
  .add(HttpApiEndpoint.get("list", "/").addSuccess(Tree.Array))
  .add(
    HttpApiEndpoint.put("upsert", "/")
      .addSuccess(Tree)
      .addError(TreeNotFoundError)
      .setPayload(UpsertTreePayload)
  )
  .add(
    HttpApiEndpoint.get("get", "/:id")
      .addSuccess(Tree)
      .addError(TreeNotFoundError)
      .setPath(
        Schema.Struct({
          id: TreeId,
        })
      )
  )
  .add(
    HttpApiEndpoint.del("delete", "/")
      .setPayload(
        Schema.Struct({
          id: TreeId,
        })
      )
      .addSuccess(Schema.Void)
      .addError(TreeNotFoundError)
  )
  .prefix("/trees") {}
