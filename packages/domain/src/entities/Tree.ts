import { faker } from "@faker-js/faker";
import { DateTime, Schema } from "effect";

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
  longitude: Schema.NumberFromString,
  latitude: Schema.NumberFromString,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.NullOr(Schema.DateTimeUtc),
}) {
  static Array = Schema.Array(this);

  static makeMock(overrides: Partial<Tree> = {}): Tree {
    return new Tree({
      id: TreeId.make(faker.string.uuid()),
      name: faker.word.words(3),
      number: faker.string.numeric(3),
      category: faker.helpers.arrayElement(["STREET", "PARK"]),
      quarter: faker.location.city(),
      address: faker.location.streetAddress(),
      family: faker.word.words(2),
      species: faker.word.words(2),
      cultivar: faker.word.words(2),
      year: faker.number.int({ min: 1900, max: 2023 }),
      longitude: faker.location.longitude(),
      latitude: faker.location.latitude(),
      createdAt: DateTime.unsafeFromDate(faker.date.past({ years: 100 })),
      updatedAt: null,
      ...overrides,
    });
  }
}
