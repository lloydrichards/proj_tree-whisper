import { Schema } from "effect";
import {
  randomArrayElement,
  randomCity,
  randomIntRange,
  randomLatitude,
  randomLongitude,
  randomNumericString,
  randomPastDateTime,
  randomStreetAddress,
  randomWords,
} from "../helpers/mock-generators";

export const TreeId = Schema.String.pipe(Schema.brand("TreeId"));

export class Tree extends Schema.Class<Tree>("Tree")({
  id: TreeId,
  name: Schema.String,
  category: Schema.Literal("STREET", "PARK"),
  quarter: Schema.String,
  address: Schema.NullOr(Schema.String),
  family: Schema.String,
  species: Schema.String,
  cultivar: Schema.NullOr(Schema.String),
  year: Schema.NullOr(Schema.Number),
  longitude: Schema.Number,
  latitude: Schema.Number,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.NullOr(Schema.DateTimeUtc),
}) {
  static Array = Schema.Array(this);

  static makeMock(overrides: Partial<Tree> = {}): Tree {
    return new Tree({
      id: TreeId.make(randomNumericString(3)),
      name: randomWords(3),
      category: randomArrayElement(["STREET", "PARK"]),
      quarter: randomCity(),
      address: randomStreetAddress(),
      family: randomWords(2),
      species: randomWords(2),
      cultivar: randomWords(2),
      year: randomIntRange(1900, 2023),
      longitude: randomLongitude(),
      latitude: randomLatitude(),
      createdAt: randomPastDateTime(100),
      updatedAt: null,
      ...overrides,
    });
  }
}
