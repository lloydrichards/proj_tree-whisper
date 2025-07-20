import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";

export const ApiResponse = Schema.Struct({
  message: Schema.String,
  success: Schema.Literal(true),
});

export class HelloGroup extends HttpApiGroup.make("hello")
  .add(HttpApiEndpoint.get("get", "/").addSuccess(ApiResponse))
  .prefix("/hello") {}
