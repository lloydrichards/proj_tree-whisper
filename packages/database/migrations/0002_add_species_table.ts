import { SqlClient } from "@effect/sql";
import { Effect } from "effect";

export default Effect.flatMap(
  SqlClient.SqlClient,
  (sql) => sql`
    -- Create enum types for species
    CREATE TYPE rate_enum AS ENUM (
      'SLOW', 'MODERATE', 'FAST'
    );

    -- Create species table
    CREATE TABLE IF NOT EXISTS species (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      common_name TEXT,
      scientific_name TEXT,
      genus TEXT,
      family TEXT,
      foliage_texture TEXT,
      fruit_shape TEXT,
      growth_form TEXT,
      growth_rate rate_enum,
      light INTEGER CHECK (light >= 1 AND light <= 10),
      humidity INTEGER CHECK (humidity >= 1 AND humidity <= 10),
      soil_ph_min DOUBLE PRECISION CHECK (soil_ph_min >= 0 AND soil_ph_min <= 14),
      soil_ph_max DOUBLE PRECISION CHECK (soil_ph_max >= 0 AND soil_ph_max <= 14),
      soil_nutriments INTEGER CHECK (soil_nutriments >= 1 AND soil_nutriments <= 10),
      soil_salinity INTEGER CHECK (soil_salinity >= 1 AND soil_salinity <= 10),
      soil_texture INTEGER CHECK (soil_texture >= 1 AND soil_texture <= 10),
      soil_humidity INTEGER CHECK (soil_humidity >= 1 AND soil_humidity <= 10),
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
