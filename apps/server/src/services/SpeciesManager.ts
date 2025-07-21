import { SqlClient, SqlSchema } from "@effect/sql";
import { PgLive } from "@repo/database";
import { Species, SpeciesId, SpeciesNotFoundError } from "@repo/domain";
import { Effect, flow, Schema } from "effect";

const CreateSpeciesInput = Species.pipe(
  Schema.omit("id", "createdAt", "updatedAt")
);

const UpdateSpeciesInput = Species.pipe(Schema.omit("createdAt", "updatedAt"));

export class SpeciesManager extends Effect.Service<SpeciesManager>()(
  "SpeciesManager",
  {
    dependencies: [PgLive],
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const findById = SqlSchema.single({
        Result: Species,
        Request: SpeciesId,
        execute: (id) => sql`
        SELECT
          *
        FROM
          species
        WHERE
          id = ${id}
      `,
      });

      const findAll = SqlSchema.findAll({
        Result: Species,
        Request: Schema.Void,
        execute: () => sql`
        SELECT
          *
        FROM
          species
      `,
      });

      const create = SqlSchema.single({
        Result: Species,
        Request: CreateSpeciesInput,
        execute: (request) => sql`
        INSERT INTO
          species ${sql.insert(request)}
        RETURNING
          *
      `,
      });

      const update = SqlSchema.single({
        Result: Species,
        Request: UpdateSpeciesInput,
        execute: (request) => sql`
        UPDATE species
        SET
          ${sql.update(request)}
        WHERE
          id = ${request.id}
        RETURNING
          *
      `,
      });

      const del = SqlSchema.single({
        Request: SpeciesId,
        Result: Schema.Unknown,
        execute: (id) => sql`
        DELETE FROM species
        WHERE
          id = ${id}
        RETURNING
          id
      `,
      });

      return {
        findById: (id: typeof SpeciesId.Type) =>
          findById(id).pipe(
            Effect.catchTags({
              NoSuchElementException: () => new SpeciesNotFoundError({ id }),
              ParseError: Effect.die,
              SqlError: Effect.die,
            })
          ),
        findAll: flow(findAll, Effect.orDie),
        del: (id: typeof SpeciesId.Type) =>
          del(id).pipe(
            Effect.asVoid,
            Effect.catchTags({
              NoSuchElementException: () => new SpeciesNotFoundError({ id }),
              ParseError: Effect.die,
              SqlError: Effect.die,
            })
          ),
        update: (request: typeof UpdateSpeciesInput.Type) =>
          update(request).pipe(
            Effect.catchTags({
              NoSuchElementException: () =>
                new SpeciesNotFoundError({ id: request.id }),
              ParseError: Effect.die,
              SqlError: Effect.die,
            })
          ),
        create: flow(create, Effect.orDie),
      } as const;
    }),
  }
) {}
