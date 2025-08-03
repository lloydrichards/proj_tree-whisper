ALTER TABLE IF EXISTS ONLY public.trees DROP CONSTRAINT IF EXISTS trees_pkey;
ALTER TABLE IF EXISTS ONLY public.species DROP CONSTRAINT IF EXISTS species_pkey;
ALTER TABLE IF EXISTS ONLY drizzle.__drizzle_migrations DROP CONSTRAINT IF EXISTS __drizzle_migrations_pkey;
ALTER TABLE IF EXISTS drizzle.__drizzle_migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.trees;
DROP TABLE IF EXISTS public.species;
DROP SEQUENCE IF EXISTS drizzle.__drizzle_migrations_id_seq;
DROP TABLE IF EXISTS drizzle.__drizzle_migrations;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP SCHEMA IF EXISTS drizzle;

CREATE SCHEMA drizzle;

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
          NEW.updated_at = now();
          RETURN NEW;
      END;
      $$;

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;

CREATE TABLE public.species (
    scientific_name text NOT NULL,
    common_name text,
    alt_names text[],
    genus text,
    family text,
    flower_color text[],
    flower_months text[],
    foliage_texture text,
    foliage_color text[],
    fruit_color text[],
    fruit_shape text,
    fruit_months text[],
    growth_rate text,
    growth_months text[],
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
    id text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    quarter text NOT NULL,
    address text,
    family text NOT NULL,
    species text NOT NULL,
    cultivar text,
    year integer,
    longitude double precision NOT NULL,
    latitude double precision NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pkey PRIMARY KEY (scientific_name);

ALTER TABLE ONLY public.trees
    ADD CONSTRAINT trees_pkey PRIMARY KEY (id);

