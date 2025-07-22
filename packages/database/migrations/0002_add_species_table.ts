import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`

    -- Create species table (new schema)
    CREATE TABLE IF NOT EXISTS species (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      common_name TEXT,
      alt_names TEXT[] DEFAULT '{}',
      scientific_name TEXT,
      genus TEXT,
      family TEXT,
      flower_color TEXT[] DEFAULT '{}',
      flower_months TEXT[] DEFAULT '{}',
      foliage_texture TEXT,
      foliage_color TEXT[] DEFAULT '{}',
      fruit_color TEXT[] DEFAULT '{}',
      fruit_shape TEXT,
      fruit_months TEXT[] DEFAULT '{}',
      growth_form TEXT,
      growth_habit TEXT[] DEFAULT '{}',
      growth_rate TEXT,
      growth_months TEXT[] DEFAULT '{}',
      light INTEGER,
      humidity INTEGER,
      soil_ph_min DOUBLE PRECISION,
      soil_ph_max DOUBLE PRECISION,
      soil_nutriments INTEGER,
      soil_salinity INTEGER,
      soil_texture INTEGER,
      soil_humidity INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE
    );

    -- Create trigger for updated_at
    CREATE TRIGGER update_species_updated_at BEFORE
      UPDATE ON species FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column ();

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_species_common_name ON species(common_name);
    CREATE INDEX IF NOT EXISTS idx_species_scientific_name ON species(scientific_name);
    CREATE INDEX IF NOT EXISTS idx_species_genus ON species(genus);
    CREATE INDEX IF NOT EXISTS idx_species_family ON species(family);
  `
);
