"""Capa de acceso a la base SQLite, compartida por todos los scrapers.

Responsabilidades:
  - Aplicar el schema si la DB no existe (mismo schema.sql que el sitio).
  - Upsert de propiedades con deduplicación por (source, source_id).
  - Registrar ejecuciones (scrape_runs) y propiedades que desaparecieron.
"""

from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from .models import RawProperty

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "alquileres.db"
SCHEMA_PATH = ROOT / "lib" / "schema.sql"


@contextmanager
def connect(db_path: Path = DB_PATH):
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if not db_path.exists():
        # Aplica schema.sql si la DB no existe (repo recién clonado).
        db_path.write_bytes(b"")
        with sqlite3.connect(db_path) as conn:
            conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def ensure_source(conn: sqlite3.Connection, slug: str, name: str, url: str) -> None:
    """Registra la fuente si no existe (INSERT OR IGNORE)."""
    conn.execute(
        "INSERT OR IGNORE INTO sources (slug, name, url) VALUES (?, ?, ?)",
        (slug, name, url),
    )


def upsert_property(conn: sqlite3.Connection, prop: RawProperty) -> str:
    """Inserta o actualiza una propiedad.

    - Si (source, source_id) no existe -> INSERT (nueva).
    - Si existe -> UPDATE de los campos mutables y last_seen_at.

    Devuelve 'new' | 'updated'.
    """
    row = prop.to_db_row()
    now = datetime.now(timezone.utc).isoformat()

    existing = conn.execute(
        "SELECT id FROM properties WHERE source = ? AND source_id = ?",
        (prop.source, prop.source_id),
    ).fetchone()

    if existing is None:
        conn.execute(
            """
            INSERT INTO properties (
              source, source_id, url, title, description,
              price_ars, price_usd, currency, expenses_ars,
              property_type, bedrooms, bathrooms, area_total, area_covered,
              garage, rooms, address, neighborhood, lat, lng,
              images_json, features_json, published_at,
              first_seen_at, last_seen_at
            ) VALUES (
              :source, :source_id, :url, :title, :description,
              :price_ars, :price_usd, :currency, :expenses_ars,
              :property_type, :bedrooms, :bathrooms, :area_total, :area_covered,
              :garage, :rooms, :address, :neighborhood, :lat, :lng,
              :images_json, :features_json, :published_at,
              :now, :now
            )
            """,
            {**row, "now": now},
        )
        return "new"

    # UPDATE: los campos identitarios (source, source_id) no cambian.
    conn.execute(
        """
        UPDATE properties SET
          url = :url,
          title = :title,
          description = :description,
          price_ars = :price_ars,
          price_usd = :price_usd,
          currency = :currency,
          expenses_ars = :expenses_ars,
          property_type = :property_type,
          bedrooms = :bedrooms,
          bathrooms = :bathrooms,
          area_total = :area_total,
          area_covered = :area_covered,
          garage = :garage,
          rooms = :rooms,
          address = :address,
          neighborhood = :neighborhood,
          lat = :lat,
          lng = :lng,
          images_json = :images_json,
          features_json = :features_json,
          published_at = COALESCE(:published_at, published_at),
          last_seen_at = :now
        WHERE source = :source AND source_id = :source_id
        """,
        {**row, "now": now},
    )
    return "updated"


def mark_unseen_as_removed(
    conn: sqlite3.Connection, source: str, seen_ids: Iterable[str]
) -> int:
    """Propiedades de `source` que NO están en `seen_ids` -> removed_properties.

    Por ahora solo las registra para auditoría. NO las borra de `properties`
    (podrían haber vuelto a publicarse, o el scraper haber fallado parcialmente).
    Devuelve cuántas marcó.
    """
    seen = set(seen_ids)
    rows = conn.execute(
        "SELECT source_id, url, title FROM properties WHERE source = ?",
        (source,),
    ).fetchall()
    removed = [r for r in rows if r["source_id"] not in seen]
    now = datetime.now(timezone.utc).isoformat()
    for r in removed:
        conn.execute(
            """
            INSERT INTO removed_properties (source, source_id, url, title, removed_at)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(source, source_id) DO UPDATE SET removed_at = excluded.removed_at
            """,
            (source, r["source_id"], r["url"], r["title"], now),
        )
    return len(removed)


def start_run(conn: sqlite3.Connection, source: str) -> int:
    now = datetime.now(timezone.utc).isoformat()
    cur = conn.execute(
        "INSERT INTO scrape_runs (source, started_at, status) VALUES (?, ?, 'running')",
        (source, now),
    )
    return cur.lastrowid


def finish_run(
    conn: sqlite3.Connection,
    run_id: int,
    *,
    status: str,
    found: int = 0,
    new: int = 0,
    updated: int = 0,
    error: str | None = None,
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        """
        UPDATE scrape_runs SET
          finished_at = ?, status = ?, found_count = ?,
          new_count = ?, updated_count = ?, error = ?
        WHERE id = ?
        """,
        (now, status, found, new, updated, error, run_id),
    )


def counts(conn: sqlite3.Connection) -> dict:
    return {
        "properties": conn.execute("SELECT COUNT(*) c FROM properties").fetchone()["c"],
        "sources": conn.execute("SELECT COUNT(*) c FROM sources").fetchone()["c"],
    }
