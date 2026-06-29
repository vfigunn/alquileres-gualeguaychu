"""Punto de entrada del scraper.

Uso:
  python -m scrapers.run                       # corre todas las fuentes
  python -m scrapers.run sources=foo,bar       # solo algunas
  python -m scrapers.run --list                # lista fuentes disponibles

Salida: imprime un resumen y deja el estado en la DB. GitHub Actions
decide si commitear el data/alquileres.db según si hubo cambios.
"""

from __future__ import annotations

import argparse
import logging
import sys

from scrapers import db
from scrapers.sources import REGISTRY


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s | %(message)s",
    )
    log = logging.getLogger("scrapers.run")

    parser = argparse.ArgumentParser(description="Scraper de alquileres")
    parser.add_argument(
        "sources",
        nargs="?",
        default="",
        help="Slugs separados por coma. Vacío = todas.",
    )
    parser.add_argument("--list", action="store_true", help="Lista fuentes y sale.")
    args = parser.parse_args()

    if args.list:
        for slug, cls in REGISTRY.items():
            print(f"{slug:30} {cls.source_name}")
        return 0

    selected = [s for s in (args.sources or "").split(",") if s]
    unknown = [s for s in selected if s not in REGISTRY]
    if unknown:
        log.error("Fuentes desconocidas: %s. Disponibles: %s", unknown, list(REGISTRY))
        return 2

    targets = [REGISTRY[s] for s in selected] if selected else list(REGISTRY.values())
    if not targets:
        log.warning("No hay fuentes registradas. Editá scrapers/sources/__init__.py.")
        return 0

    exit_code = 0
    totals = {"found": 0, "new": 0, "updated": 0, "errors": 0, "removed": 0}
    for cls in targets:
        try:
            r = cls().run()
            for k in totals:
                totals[k] += getattr(r, k)
        except Exception as exc:  # noqa: BLE001
            exit_code = 1
            log.exception("Scraper %s falló por completo: %s", cls.source, exc)

    log.info("TOTAL found=%d new=%d updated=%d errors=%d removed=%d", *totals.values())

    with db.connect() as conn:
        c = db.counts(conn)
    log.info("DB final: %d propiedades, %d fuentes.", c["properties"], c["sources"])

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
