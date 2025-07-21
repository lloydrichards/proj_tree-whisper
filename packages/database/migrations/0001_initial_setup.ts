import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    CREATE TABLE IF NOT EXISTS trees (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      number VARCHAR(50) NOT NULL,
      category VARCHAR(20) NOT NULL CHECK (category IN ('STREET', 'PARK')),
      quarter VARCHAR(100) NOT NULL,
      address VARCHAR(200) NOT NULL,
      family VARCHAR(100) NOT NULL,
      species VARCHAR(100) NOT NULL,
      cultivar VARCHAR(100) NOT NULL,
      year INTEGER NOT NULL CHECK (year >= 0),
      longitude DECIMAL(10, 7) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
      latitude DECIMAL(10, 7) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );

    CREATE OR REPLACE FUNCTION update_updated_at_column () RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = now();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

    CREATE TRIGGER update_trees_updated_at BEFORE
      UPDATE ON trees FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column ();
    

    CREATE INDEX IF NOT EXISTS idx_trees_species ON trees(species);
    CREATE INDEX IF NOT EXISTS idx_trees_location ON trees(quarter);
    CREATE INDEX IF NOT EXISTS idx_trees_category ON trees(category);
  `
);
