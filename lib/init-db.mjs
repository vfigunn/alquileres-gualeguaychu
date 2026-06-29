// Crea (o verifica) la base SQLite leyendo schema.sql.
// Uso:
//   node lib/init-db.mjs            -> crea data/alquileres.db si no existe
//   node lib/init-db.mjs --seed     -> además carga datos de ejemplo
//
// Es idempotente: CREATE TABLE IF NOT EXISTS.

import Database from "better-sqlite3";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "..", "data");
const DB_PATH = resolve(DATA_DIR, "alquileres.db");
const SCHEMA_PATH = resolve(__dirname, "schema.sql");

const args = new Set(process.argv.slice(2));
const seed = args.has("--seed");

mkdirSync(DATA_DIR, { recursive: true });

const schema = readFileSync(SCHEMA_PATH, "utf-8");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(schema);

console.log(`[init-db] Base lista en ${DB_PATH}`);

if (seed && !existsSync(resolve(DATA_DIR, ".seeded"))) {
  const { seedDatabase } = await import("./seed-data.mjs");
  const counts = seedDatabase(db);
  console.log(
    `[init-db] Sembrado: ${counts.sources} fuentes, ${counts.properties} propiedades.`
  );
} else if (seed) {
  console.log("[init-db] Ya estaba sembrada (.seeded presente), omito seed.");
}

db.close();
