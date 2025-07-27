import { SqlClient, SqlSchema } from "@effect/sql";
import type { Fragment, Primitive } from "@effect/sql/Statement";
import { PgLive } from "@repo/database";
import { Species, SpeciesId, SpeciesNotFoundError } from "@repo/domain";
import { Effect, flow, Schema } from "effect";

const CreateSpeciesInput = Species.pipe(Schema.omit("createdAt", "updatedAt"));

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
          scientific_name = ${id}
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

      const findBySearch = SqlSchema.findAll({
        Result: Species,
        Request: Schema.String,
        execute: (search) => {
          const containsPattern = `%${search}%`;
          const startsWithPattern = `${search}%`;
          return sql`
            SELECT *
            FROM species
            WHERE
              scientific_name ILIKE ${containsPattern}
              OR common_name ILIKE ${containsPattern}
              OR family ILIKE ${containsPattern}
              OR genus ILIKE ${containsPattern}
            ORDER BY
              CASE
                WHEN scientific_name ILIKE ${search} THEN 1
                WHEN common_name ILIKE ${search} THEN 1
                WHEN scientific_name ILIKE ${startsWithPattern} THEN 2
                WHEN common_name ILIKE ${startsWithPattern} THEN 2
                WHEN genus ILIKE ${startsWithPattern} THEN 3
                WHEN family ILIKE ${startsWithPattern} THEN 3
                WHEN scientific_name ILIKE ${containsPattern} THEN 4
                WHEN common_name ILIKE ${containsPattern} THEN 4
                WHEN genus ILIKE ${containsPattern} THEN 5
                WHEN family ILIKE ${containsPattern} THEN 5
                ELSE 6
              END,
              scientific_name
            LIMIT 10
          `;
        },
      });

      const create = SqlSchema.single({
        Result: Species,
        Request: CreateSpeciesInput,
        execute: (request) => sql`
        INSERT INTO
          species ${sql.insert(
            request as unknown as Record<
              string,
              Primitive | Fragment | undefined
            >
          )}
        ON CONFLICT (scientific_name)
        DO UPDATE SET
          ${sql.update(
            request as unknown as Record<
              string,
              Primitive | Fragment | undefined
            >
          )}
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
          ${sql.update(
            request as unknown as Record<
              string,
              Primitive | Fragment | undefined
            >
          )}
        WHERE
          scientific_name = ${request.scientificName}
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
          scientific_name = ${id}
        RETURNING
          scientific_name
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
        findBySearch: flow(findBySearch, Effect.orDie),
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
                new SpeciesNotFoundError({ id: request.scientificName }),
              ParseError: Effect.die,
              SqlError: Effect.die,
            })
          ),
        create: flow(create, Effect.orDie),
      } as const;
    }),
  }
) {}
