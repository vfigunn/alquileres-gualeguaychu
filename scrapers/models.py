"""Modelo de datos que los scrapers producen.

Este es el "contrato" entre un scraper (cualquier fuente) y la capa
de persistencia. Un scraper solo tiene que devolver una lista de
`RawProperty`. La deduplicación y el guardado se encargan en `db.py`.

Mantener este modelo sincronizado con lib/schema.sql (columnas de
la tabla `properties`).
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class RawProperty:
    # ---- obligatorios (identidad + dedup) ----
    source: str                # slug de la fuente (debe existir en sources.slug)
    source_id: str             # ID único dentro de esa fuente
    url: str                   # URL pública de la ficha original

    # ---- descriptivos ----
    title: Optional[str] = None
    description: Optional[str] = None

    # ---- precio ----
    price_ars: Optional[int] = None
    price_usd: Optional[int] = None
    currency: Optional[str] = None     # 'ARS' | 'USD'
    expenses_ars: Optional[int] = None

    # ---- características físicas ----
    property_type: Optional[str] = None  # casa | departamento | ph | ...
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_total: Optional[int] = None
    area_covered: Optional[int] = None
    garage: int = 0
    rooms: Optional[int] = None

    # ---- ubicación ----
    address: Optional[str] = None
    neighborhood: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

    # ---- multimedia / amenities ----
    images: list[str] = field(default_factory=list)
    features: list[str] = field(default_factory=list)

    # ---- metadatos ----
    published_at: Optional[str] = None   # ISO 8601 si se conoce

    def to_db_row(self) -> dict:
        """Convierte a dict listo para INSERT/UPDATE en Supabase (PostgREST).

        Los campos JSONB (images_json, features_json) van como listas Python,
        no como strings — PostgREST las serializa automáticamente.
        """
        d = asdict(self)
        d["images_json"] = d.pop("images") or []
        d["features_json"] = d.pop("features") or []
        return d
