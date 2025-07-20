import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";

export const HealthResponse = Schema.Struct({
  message: Schema.String,
  success: Schema.Literal(true),
});

export class HealthGroup extends HttpApiGroup.make("health")
  .add(HttpApiEndpoint.get("get", "/").addSuccess(HealthResponse))
  .prefix("/health") {}
