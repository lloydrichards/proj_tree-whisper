import { Schema } from "effect";

export const TreeId = Schema.UUID.pipe(Schema.brand("TreeId"));

export class Tree extends Schema.Class<Tree>("Tree")({
  id: TreeId,
  name: Schema.String,
  number: Schema.String,
  category: Schema.Literal("STREET", "PARK"),
  quarter: Schema.String,
  address: Schema.String,
  family: Schema.String,
  species: Schema.String,
  cultivar: Schema.String,
  year: Schema.Number,
  longitude: Schema.Number,
  latitude: Schema.Number,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.NullOr(Schema.DateTimeUtc),
}) {
  static Array = Schema.Array(this);
}
