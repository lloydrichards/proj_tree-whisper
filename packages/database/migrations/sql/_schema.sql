DROP TRIGGER IF EXISTS update_trees_updated_at ON public.trees;
DROP TRIGGER IF EXISTS update_species_updated_at ON public.species;
DROP INDEX IF EXISTS public.idx_trees_species;
DROP INDEX IF EXISTS public.idx_trees_location;
DROP INDEX IF EXISTS public.idx_trees_category;
DROP INDEX IF EXISTS public.idx_species_scientific_name;
DROP INDEX IF EXISTS public.idx_species_genus;
DROP INDEX IF EXISTS public.idx_species_family;
DROP INDEX IF EXISTS public.idx_species_common_name;
ALTER TABLE IF EXISTS ONLY public.trees DROP CONSTRAINT IF EXISTS trees_pkey;
ALTER TABLE IF EXISTS ONLY public.species DROP CONSTRAINT IF EXISTS species_pkey;
ALTER TABLE IF EXISTS ONLY public.effect_sql_migrations DROP CONSTRAINT IF EXISTS effect_sql_migrations_pkey;
DROP TABLE IF EXISTS public.trees;
DROP TABLE IF EXISTS public.species;
DROP TABLE IF EXISTS public.effect_sql_migrations;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
          NEW.updated_at = now();
          RETURN NEW;
      END;
      $$;

CREATE TABLE public.effect_sql_migrations (
    migration_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL
);

CREATE TABLE public.species (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    common_name text,
    alt_names text[] DEFAULT '{}'::text[],
    scientific_name text,
    genus text,
    family text,
    flower_color text[] DEFAULT '{}'::text[],
    flower_months text[] DEFAULT '{}'::text[],
    foliage_texture text,
    foliage_color text[] DEFAULT '{}'::text[],
    fruit_color text[] DEFAULT '{}'::text[],
    fruit_shape text,
    fruit_months text[] DEFAULT '{}'::text[],
    growth_form text,
    growth_habit text[] DEFAULT '{}'::text[],
    growth_rate text,
    growth_months text[] DEFAULT '{}'::text[],
    light integer,
    humidity integer,
    soil_ph_min double precision,
    soil_ph_max double precision,
    soil_nutriments integer,
    soil_salinity integer,
    soil_texture integer,
    soil_humidity integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);

CREATE TABLE public.trees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    number character varying(50) NOT NULL,
    category character varying(20) NOT NULL,
    quarter character varying(100) NOT NULL,
    address character varying(200) NOT NULL,
    family character varying(100) NOT NULL,
    species character varying(100) NOT NULL,
    cultivar character varying(100) NOT NULL,
    year integer NOT NULL,
    longitude numeric(10,7) NOT NULL,
    latitude numeric(10,7) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    CONSTRAINT trees_category_check CHECK (((category)::text = ANY ((ARRAY['STREET'::character varying, 'PARK'::character varying])::text[]))),
    CONSTRAINT trees_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT trees_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))),
    CONSTRAINT trees_year_check CHECK ((year >= 0))
);

ALTER TABLE ONLY public.effect_sql_migrations
    ADD CONSTRAINT effect_sql_migrations_pkey PRIMARY KEY (migration_id);

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.trees
    ADD CONSTRAINT trees_pkey PRIMARY KEY (id);

CREATE INDEX idx_species_common_name ON public.species USING btree (common_name);

CREATE INDEX idx_species_family ON public.species USING btree (family);

CREATE INDEX idx_species_genus ON public.species USING btree (genus);

CREATE INDEX idx_species_scientific_name ON public.species USING btree (scientific_name);

CREATE INDEX idx_trees_category ON public.trees USING btree (category);

CREATE INDEX idx_trees_location ON public.trees USING btree (quarter);

CREATE INDEX idx_trees_species ON public.trees USING btree (species);

CREATE TRIGGER update_species_updated_at BEFORE UPDATE ON public.species FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trees_updated_at BEFORE UPDATE ON public.trees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

