-- =============================================================
-- Alquileres Gualeguaychú - Esquema para Supabase (Postgres)
-- =============================================================
-- Copiar y ejecutar en el SQL Editor de Supabase.
--
-- Notas:
--  - Postgres no tiene AUTOINCREMENT; usamos GENERATED ALWAYS AS IDENTITY.
--  - Booleanos se manejan como BOOLEAN en vez de INTEGER 1/0.
--  - JSON arrays se guardan como JSONB para poder indexar si hace falta.
--  - Se mantiene el UNIQUE(source, source_id) para deduplicación.
--  - Se habilita RLS y se permite lectura anónima (anon key).
-- =============================================================

-- Habilitar extensión UUID (por si se necesita más adelante)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Catálogo de fuentes (inmobiliarias)
CREATE TABLE IF NOT EXISTS sources (
  slug        TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Propiedades
CREATE TABLE IF NOT EXISTS properties (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source          TEXT NOT NULL REFERENCES sources(slug),
  source_id       TEXT NOT NULL,
  url             TEXT NOT NULL,

  title           TEXT,
  description     TEXT,

  price_ars       BIGINT,
  price_usd       BIGINT,
  currency        TEXT CHECK (currency IN ('ARS', 'USD')),
  expenses_ars    BIGINT,

  property_type   TEXT CHECK (property_type IN ('casa', 'departamento', 'ph', 'terreno', 'local', 'galpon', 'otro')),
  operation       TEXT NOT NULL DEFAULT 'alquiler',

  bedrooms        INTEGER,
  bathrooms       INTEGER,
  area_total      INTEGER,
  area_covered    INTEGER,
  garage          INTEGER DEFAULT 0,
  rooms           INTEGER,

  address         TEXT,
  neighborhood    TEXT,
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,

  images_json     JSONB DEFAULT '[]'::jsonb,
  features_json   JSONB DEFAULT '[]'::jsonb,

  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  hidden          BOOLEAN NOT NULL DEFAULT FALSE,

  first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at    TIMESTAMPTZ,

  UNIQUE (source, source_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_properties_type        ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_featured    ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_hidden      ON properties(hidden);
CREATE INDEX IF NOT EXISTS idx_properties_price_ars   ON properties(price_ars);
CREATE INDEX IF NOT EXISTS idx_properties_price_usd   ON properties(price_usd);
CREATE INDEX IF NOT EXISTS idx_properties_published   ON properties(published_at);

-- Auditoría de scrapers
CREATE TABLE IF NOT EXISTS scrape_runs (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source          TEXT REFERENCES sources(slug),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  status          TEXT CHECK (status IN ('ok', 'error', 'partial')),
  found_count     INTEGER DEFAULT 0,
  new_count       INTEGER DEFAULT 0,
  updated_count   INTEGER DEFAULT 0,
  error           TEXT
);

-- Marcado de propiedades removidas
CREATE TABLE IF NOT EXISTS removed_properties (
  source          TEXT NOT NULL,
  source_id       TEXT NOT NULL,
  url             TEXT,
  title           TEXT,
  removed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (source, source_id)
);

-- =============================================================
-- Row Level Security (RLS): lectura pública, escritura solo autenticada/service_role
-- =============================================================
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE removed_properties ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede leer propiedades visibles
CREATE POLICY "Allow public read properties"
  ON properties
  FOR SELECT
  TO anon, authenticated
  USING (hidden = FALSE);

-- Política: cualquiera puede leer fuentes habilitadas
CREATE POLICY "Allow public read sources"
  ON sources
  FOR SELECT
  TO anon, authenticated
  USING (enabled = TRUE);

-- Política: solo service_role puede escribir
CREATE POLICY "Allow service role write properties"
  ON properties
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Allow service role write sources"
  ON sources
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Allow service role write scrape_runs"
  ON scrape_runs
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "Allow service role write removed_properties"
  ON removed_properties
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);
