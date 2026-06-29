// Genera el JSON estático que consume el sitio, leyendo el SQLite.
// Se ejecuta automáticamente antes de `next build` (script "prebuild").
// Output: public/data/properties.json  +  public/data/property-<id>.json
//
// Si la DB no existe todavía (repo recién clonado sin scrapers), se crea
// y se siembra con datos demo para que el sitio nunca rompa.

import Database from "better-sqlite3";
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "..", "data");
const PUBLIC_DIR = resolve(__dirname, "..", "public", "data");
const DB_PATH = resolve(DATA_DIR, "alquileres.db");
const SCHEMA_PATH = resolve(__dirname, "schema.sql");

function ensureDatabase() {
  if (existsSync(DB_PATH)) return;
  console.warn(
    "[build-data] No existe data/alquileres.db. Creando una nueva + datos demo."
  );
  mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(readFileSync(SCHEMA_PATH, "utf-8"));
  db.close();
}

ensureDatabase();

const db = new Database(DB_PATH, { readonly: true });

const props = db
  .prepare(
    `SELECT
       id, source, source_id, url,
       title, description,
       price_ars, price_usd, currency, expenses_ars,
       property_type, operation,
       bedrooms, bathrooms, area_total, area_covered, garage, rooms,
       address, neighborhood, lat, lng,
       images_json, features_json,
       featured, hidden,
       first_seen_at, last_seen_at, published_at
     FROM properties
     WHERE hidden = 0
     ORDER BY featured DESC, published_at DESC, first_seen_at DESC`
  )
  .all();

const sources = db
  .prepare(`SELECT slug, name, url, enabled FROM sources ORDER BY name`)
  .all();

db.close();

const dataset = {
  generated_at: new Date().toISOString(),
  sources,
  properties: props.map((p) => ({
    ...p,
    featured: !!p.featured,
    hidden: !!p.hidden,
    images: safeJsonArray(p.images_json),
    features: safeJsonArray(p.features_json),
    images_json: undefined,
    features_json: undefined,
  })),
};

mkdirSync(PUBLIC_DIR, { recursive: true });

// Dataset completo (buscador).
writeFileSync(
  resolve(PUBLIC_DIR, "properties.json"),
  JSON.stringify(dataset),
  "utf-8"
);
// Una ficha por propiedad, para hidratar la página de detalle.
// Volumen chico (alquileres de una ciudad), no preocupa el tamaño.
for (const p of dataset.properties) {
  writeFileSync(
    resolve(PUBLIC_DIR, `property-${p.id}.json`),
    JSON.stringify(p),
    "utf-8"
  );
}

console.log(
  `[build-data] ${dataset.properties.length} propiedades + ${dataset.sources.length} fuentes -> public/data/`
);

function safeJsonArray(s) {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
