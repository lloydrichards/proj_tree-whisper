import { Database, PgLive } from "@repo/database";
import { species } from "@repo/database/schema";
import {
  NoSpeciesFoundError,
  SpeciesId,
  SpeciesNotFoundError,
  type UpsertSpeciesPayload,
} from "@repo/domain";
import { eq } from "drizzle-orm";
import { Effect, flow, Schema } from "effect";

export class SpeciesManager extends Effect.Service<SpeciesManager>()(
  "SpeciesManager",
  {
    dependencies: [PgLive],
    effect: Effect.gen(function* () {
      const db = yield* Database;

      const findByName = (input: string) =>
        Effect.gen(function* () {
          const id = yield* Schema.decode(SpeciesId)(input);
          const result = yield* db.query.species.findFirst({
            where: eq(species.scientificName, id),
          });
          if (result == null) {
            return yield* Effect.fail(new SpeciesNotFoundError({ id }));
          }
          return result;
        });

      const findAll = () =>
        Effect.gen(function* () {
          const results = yield* db.query.species.findMany();

          if (results.length === 0) {
            return yield* Effect.fail(new NoSpeciesFoundError());
          }
          return results;
        });

      const create = (input: typeof UpsertSpeciesPayload.Type) =>
        db.insert(species).values(input).returning().pipe(Effect.head);

      const update = (input: typeof species.$inferInsert) =>
        db
          .update(species)
          .set(input)
          .where(eq(species.scientificName, input.scientificName));

      const del = (id: string) =>
        db.delete(species).where(eq(species.scientificName, id));

      return {
        findByName: (id: string) =>
          findByName(id).pipe(
            Effect.catchTags({
              ParseError: Effect.die,
              SqlError: Effect.die,
            })
          ),
        findAll: flow(
          findAll,
          Effect.catchTags({
            SqlError: Effect.die,
          })
        ),
        del: flow(
          del,
          Effect.catchTags({
            SqlError: Effect.die,
          })
        ),
        update: flow(
          update,
          Effect.catchTags({
            SqlError: Effect.die,
          })
        ),
        create: flow(
          create,
          Effect.catchTags({
            NoSuchElementException: Effect.die,
            SqlError: Effect.die,
          })
        ),
      } as const;
    }),
  }
) {}
