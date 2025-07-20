import { SqlClient, SqlSchema } from "@effect/sql";
import { PgLive } from "@repo/database";
import { Tree, TreeId, TreeNotFoundError } from "@repo/domain";
import { Effect, flow, Schema } from "effect";

const CreateStyleInput = Tree.pipe(Schema.omit("id", "createdAt", "updatedAt"));

const UpdateStyleInput = Tree.pipe(Schema.omit("createdAt", "updatedAt"));

export class TreeManager extends Effect.Service<TreeManager>()("TreeManager", {
  dependencies: [PgLive],
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    const findById = SqlSchema.single({
      Result: Tree,
      Request: TreeId,
      execute: (id) => sql`
        SELECT
          *
        FROM
          styles
        WHERE
          id = ${id}
      `,
    });

    const findAll = SqlSchema.findAll({
      Result: Tree,
      Request: Schema.Void,
      execute: () => sql`
        SELECT
          *
        FROM
          styles
      `,
    });

    const create = SqlSchema.single({
      Result: Tree,
      Request: CreateStyleInput,
      execute: (request) => sql`
        INSERT INTO
          styles ${sql.insert(request)}
        RETURNING
          *
      `,
    });

    const update = SqlSchema.single({
      Result: Tree,
      Request: UpdateStyleInput,
      execute: (request) => sql`
        UPDATE styles
        SET
          ${sql.update(request)}
        WHERE
          id = ${request.id}
        RETURNING
          *
      `,
    });

    const del = SqlSchema.single({
      Request: TreeId,
      Result: Schema.Unknown,
      execute: (id) => sql`
        DELETE FROM styles
        WHERE
          id = ${id}
        RETURNING
          id
      `,
    });

    return {
      findById: (id: typeof TreeId.Type) =>
        findById(id).pipe(
          Effect.catchTags({
            NoSuchElementException: () => new TreeNotFoundError({ id }),
            ParseError: Effect.die,
            SqlError: Effect.die,
          })
        ),
      findAll: flow(findAll, Effect.orDie),
      del: (id: typeof TreeId.Type) =>
        del(id).pipe(
          Effect.asVoid,
          Effect.catchTags({
            NoSuchElementException: () => new TreeNotFoundError({ id }),
            ParseError: Effect.die,
            SqlError: Effect.die,
          })
        ),
      update: (request: typeof UpdateStyleInput.Type) =>
        update(request).pipe(
          Effect.catchTags({
            NoSuchElementException: () =>
              new TreeNotFoundError({ id: request.id }),
            ParseError: Effect.die,
            SqlError: Effect.die,
          })
        ),
      create: flow(create, Effect.orDie),
    } as const;
  }),
}) {}
