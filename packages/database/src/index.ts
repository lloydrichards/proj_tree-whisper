import { PgClient } from "@effect/sql-pg";
import {
  Config,
  Duration,
  Effect,
  identity,
  Layer,
  Schedule,
  String,
} from "effect";

const stripSQLValueEntries = (typeIds: readonly number[]) => {
  return Object.fromEntries(
    typeIds.map((typeId) => [
      typeId,
      {
        to: 25,
        from: [typeId] as number[],
        parse: identity,
        serialize: identity,
      },
    ])
  );
};

export const pgConfig = {
  transformQueryNames: String.camelToSnake,
  transformResultNames: String.snakeToCamel,
  // - 114: JSON (return as string instead of parsed object)
  // - 1082: DATE
  // - 1114: TIMESTAMP WITHOUT TIME ZONE
  // - 1184: TIMESTAMP WITH TIME ZONE
  // - 3802: JSONB (return as string instead of parsed object)
  types: stripSQLValueEntries([114, 1082, 1114, 1184, 3802]),
} as const;

export const PgLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    return PgClient.layer({
      url: yield* Config.redacted("DB_URL"),
      ...pgConfig,
    });
  })
).pipe((self) =>
  Layer.retry(
    self,
    Schedule.identity<Layer.Layer.Error<typeof self>>().pipe(
      Schedule.check((input) => input._tag === "SqlError"),
      Schedule.intersect(Schedule.exponential("1 second")),
      Schedule.intersect(Schedule.recurs(2)),
      Schedule.onDecision(([[_error, duration], attempt], decision) =>
        decision._tag === "Continue"
          ? Effect.logInfo(
              `Retrying database connection in ${Duration.format(
                duration
              )} (attempt #${++attempt})`
            )
          : Effect.void
      )
    )
  )
);
