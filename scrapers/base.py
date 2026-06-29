"""Clase base para todos los scrapers de inmobiliarias.

Cada fuente concreta hereda de `BaseScraper` e implementa:
  - `discover_listings()` -> lista de URLs de ficha (o IDs+URLs).
  - `parse_detail(url)`   -> un RawProperty a partir de la ficha.

La base se encarga de:
  - Garantizar que la fuente exista en `sources`.
  - Iterar las fichas, llamar a `parse_detail`.
  - Hacer upsert con deduplicación (supabase_client.upsert_property).
  - Registrar la corrida (scrape_runs) y marcar las que desaparecieron.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Iterable

from . import supabase_client as db
from .models import RawProperty

log = logging.getLogger(__name__)


@dataclass
class ScrapeResult:
    found: int = 0
    new: int = 0
    updated: int = 0
    errors: int = 0
    removed: int = 0


class BaseScraper:
    # Sobreescribir en subclases.
    source: str = ""        # slug, debe ser único y estable
    source_name: str = ""   # nombre para mostrar
    source_url: str = ""    # URL raíz

    # Pausa entre requests de ficha (segundos). Sé amable con el sitio.
    detail_delay: float = 0.5
    # Máximo de fichas a procesar por corrida (tope de seguridad).
    max_details: int = 200

    # ---- API a implementar por cada fuente ----

    def discover_listings(self) -> Iterable[tuple[str, str]]:
        """Devuelve pares (source_id, url) de las propiedades vigentes.

        source_id es el identificador estable de la propiedad en el sitio
        original (el que usa el UNIQUE). Si no lo podés extraer del listado,
        podés derivarlo de la URL (ver helpers.id_from_url).
        """
        raise NotImplementedError

    def parse_detail(self, url: str) -> RawProperty | None:
        """Extrae una propiedad a partir de su URL de ficha.

        Devuelve None si la ficha no se pudo procesar (se cuenta como error).
        Importante: fijar `.source = self.source` y `.source_id` correctamente.
        """
        raise NotImplementedError

    # ---- Orquestación ----

    def run(self) -> ScrapeResult:
        result = ScrapeResult()

        # Registrar la fuente en Supabase si no existe
        try:
            db.ensure_source(self.source, self.source_name, self.source_url)
        except Exception as exc:
            log.exception("ensure_source falló para %s", self.source)
            # Seguimos igual — puede que ya exista

        run_id = db.start_run(self.source)

        try:
            listings = list(self.discover_listings())
        except Exception as exc:  # noqa: BLE001
            log.exception("discover_listings falló para %s", self.source)
            db.finish_run(run_id, status="error", error=str(exc))
            return result

        seen_ids: list[str] = []
        for source_id, url in listings[: self.max_details]:
            result.found += 1
            try:
                prop = self.parse_detail(url)
                if prop is None:
                    result.errors += 1
                    continue
                # Aseguramos identidad (el scraper podría olvidarse).
                prop.source = self.source
                prop.source_id = source_id
                outcome = db.upsert_property(prop.to_db_row())
                if outcome == "new":
                    result.new += 1
                else:
                    result.updated += 1
                seen_ids.append(source_id)
            except Exception as exc:  # noqa: BLE001
                result.errors += 1
                log.warning("Error parseando %s: %s", url, exc)
            time.sleep(self.detail_delay)

        result.removed = db.mark_unseen_as_removed(self.source, seen_ids)
        db.finish_run(
            run_id,
            status="partial" if result.errors else "ok",
            found=result.found,
            new=result.new,
            updated=result.updated,
        )
        log.info(
            "[%s] found=%d new=%d updated=%d errors=%d removed=%d",
            self.source,
            result.found,
            result.new,
            result.updated,
            result.errors,
            result.removed,
        )
        return result
