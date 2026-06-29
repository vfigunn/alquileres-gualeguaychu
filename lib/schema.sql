-- =============================================================
-- Alquileres Gualeguaychú - Esquema de base de datos (SQLite)
-- =============================================================
-- Este archivo lo usan tanto el init de Node (para el sitio)
-- como los scrapers de Python. Mantener las dos partes en sync.
--
-- El sitio solo LEE esta base en build-time para generar JSON
-- estático. Los scrapers la ESCRIBEN.
--
-- NOTA de migración a Supabase: las tablas `properties`,
-- `sources` y `scrape_runs` mapean 1:1 a tablas Postgres. La
-- columna de IDs de cada fuente (`source_id`) debe quedar como
-- UNIQUE junto con `source` para que la deduplicación funcione.
-- =============================================================

-- Catálogo de fuentes (inmobiliarias). Cada scraper está
-- asociado a una fuente por su `slug`.
CREATE TABLE IF NOT EXISTS sources (
  slug        TEXT PRIMARY KEY,            -- ej: "inmobiliaria-x"
  name        TEXT NOT NULL,               -- nombre para mostrar
  url         TEXT NOT NULL,               -- URL raíz del sitio
  enabled     INTEGER NOT NULL DEFAULT 1,  -- 1/0
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Propiedades. La deduplicación se apoya en el UNIQUE compuesto
-- (source, source_id): el scraper hace INSERT ... ON CONFLICT DO
-- NOTHING y luego UPDATE de los campos mutables.
CREATE TABLE IF NOT EXISTS properties (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT UNIQUE,
  source          TEXT NOT NULL,                -- FK sources.slug
  source_id       TEXT NOT NULL,                -- ID en el sitio original
  url             TEXT NOT NULL,                -- URL de la ficha original

  title           TEXT,                         -- título de la publicación
  description     TEXT,
  price_ars       INTEGER,                      -- precio en pesos (mensual)
  price_usd       INTEGER,                      -- precio en dólares (mensual)
  currency        TEXT,                         -- 'ARS' | 'USD' | null
  expenses_ars    INTEGER,                      -- expensas

  property_type   TEXT,                         -- casa | departamento | ...
  operation       TEXT NOT NULL DEFAULT 'alquiler',

  bedrooms        INTEGER,                      -- dormitorios / habitaciones
  bathrooms       INTEGER,
  area_total      INTEGER,                      -- m² totales
  area_covered    INTEGER,                      -- m² cubiertos
  garage          INTEGER DEFAULT 0,            -- cocheras
  rooms           INTEGER,                      -- ambientes

  address         TEXT,
  neighborhood    TEXT,                         -- barrio
  lat             REAL,
  lng             REAL,

  images_json     TEXT,                         -- JSON array de URLs externas
  features_json   TEXT,                         -- JSON array de amenities

  -- Gobernado manualmente por el admin (panel futuro).
  featured        INTEGER NOT NULL DEFAULT 0,   -- 1 = aparece primero
  hidden          INTEGER NOT NULL DEFAULT 0,   -- 1 = no se publica

  first_seen_at   TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at    TEXT NOT NULL DEFAULT (datetime('now')),
  published_at    TEXT,                         -- fecha de publicación original (si se conoce)

  UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS idx_properties_type        ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood ON properties(neighborhood);
CREATE INDEX IF NOT EXISTS idx_properties_featured    ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_hidden      ON properties(hidden);
CREATE INDEX IF NOT EXISTS idx_properties_price       ON properties(price_ars);

-- Historial de ejecuciones del scraper (auditoría).
CREATE TABLE IF NOT EXISTS scrape_runs (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  source          TEXT,
  started_at      TEXT NOT NULL,
  finished_at     TEXT,
  status          TEXT,                         -- ok | error | partial
  found_count     INTEGER DEFAULT 0,            -- propiedades vistas
  new_count       INTEGER DEFAULT 0,            -- insertadas nuevas
  updated_count   INTEGER DEFAULT 0,            -- actualizadas
  error           TEXT,
  FOREIGN KEY (source) REFERENCES sources(slug)
);

-- Marcado de propiedades que desaparecieron del sitio original
-- en la última corrida (para auditoría / limpieza futura).
CREATE TABLE IF NOT EXISTS removed_properties (
  source          TEXT NOT NULL,
  source_id       TEXT NOT NULL,
  url             TEXT,
  title           TEXT,
  removed_at      TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (source, source_id)
);
