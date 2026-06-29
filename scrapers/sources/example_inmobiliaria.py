"""Scraper de EJEMPLO configurable con Firecrawl (JSON schema).

ESTO ES UNA PLANTILLA. Cuando me pases la URL real de una inmobiliaria,
voy a:
  1. Confirmar cómo es la URL del listado y de la ficha.
  2. Ajustar `listings_url` y el `LISTING_SCHEMA` / `DETAIL_SCHEMA`.
  3. Dejar el scraper real en este mismo directorio (un .py por fuente).

Mientras tanto este scraper funciona "de mentira" (sin tocar la red) si
no hay API key, para que el orquestador y el CI no rompan.

Cómo activarlo cuando tengas la URL:
  - Editá las constantes de abajo (LISTINGS_URL, source, etc.).
  - Corré:  python -m scrapers.run sources=example_inmobiliaria
  - Ajustá los esquemas según lo que devuelva Firecrawl.
"""

from __future__ import annotations

from typing import Iterable
from urllib.parse import urljoin

from scrapers import firecrawl_client as fc
from scrapers.base import BaseScraper
from scrapers.models import RawProperty
from scrapers.parsing import (
    clean,
    id_from_url,
    normalize_type,
    parse_int,
    parse_price,
)

# ====== CONFIGURACIÓN DE LA FUENTE (EDITAR ESTO) =========================

LISTINGS_URL = "https://www.inmobiliaria-ejemplo.com.ar/alquileres"
BASE_URL = "https://www.inmobiliaria-ejemplo.com.ar"

# Esquema del listado: pedimos a Firecrawl que extraiga, por cada ficha,
# el link y un ID si está visible. Esto suele bastar para descubrir.
LISTING_SCHEMA = {
    "type": "object",
    "properties": {
        "links": {
            "type": "array",
            "items": {"type": "string"},
            "description": "URLs de cada propiedad en alquiler.",
        }
    },
    "required": ["links"],
}

# Esquema de la ficha individual. Cuanto más estructurado, mejor.
DETAIL_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "description": {"type": "string"},
        "price": {"type": "string"},          # 'U$S 320.000' / '$ 350.000'
        "expenses": {"type": "string"},        # expensas
        "property_type": {"type": "string"},   # 'Departamento', 'Casa'...
        "bedrooms": {"type": "string"},        # '2 dormitorios'
        "bathrooms": {"type": "string"},
        "area": {"type": "string"},            # '80 m²'
        "address": {"type": "string"},
        "neighborhood": {"type": "string"},
        "images": {"type": "array", "items": {"type": "string"}},
        "features": {"type": "array", "items": {"type": "string"}},
    },
}

# ==========================================================================


class ExampleInmobiliariaScraper(BaseScraper):
    source = "example-inmobiliaria"
    source_name = "Inmobiliaria Ejemplo"
    source_url = BASE_URL

    def discover_listings(self) -> Iterable[tuple[str, str]]:
        # Firecrawl map suele ser la forma más barata de listar URLs.
        try:
            links = fc.map_site(LISTINGS_URL, search="alquiler")
            links = [
                urljoin(BASE_URL, u)
                for u in links
                if "/propiedad" in u or "/inmueble" in u or "/alquiler" in u
            ]
        except fc.FirecrawlError:
            links = []

        for url in links:
            yield id_from_url(url), url

    def parse_detail(self, url: str) -> RawProperty | None:
        data = fc.scrape(url, json_schema=DETAIL_SCHEMA, prompt=(
            "Extraé los datos de esta propiedad en alquiler de Gualeguaychú."
        ))
        # Firecrawl devuelve la estructura bajo .json cuando format=json.
        d = data.get("json") or {}

        price_amount, currency = parse_price(d.get("price"))
        price_usd = price_amount if currency == "USD" else None
        price_ars = price_amount if currency == "ARS" else None

        return RawProperty(
            source=self.source,
            source_id=id_from_url(url),
            url=url,
            title=clean(d.get("title")),
            description=clean(d.get("description")),
            price_ars=price_ars,
            price_usd=price_usd,
            currency=currency,
            expenses_ars=parse_int(d.get("expenses")),
            property_type=normalize_type(d.get("property_type")),
            bedrooms=parse_int(d.get("bedrooms")),
            bathrooms=parse_int(d.get("bathrooms")),
            area_total=parse_int(d.get("area")),
            address=clean(d.get("address")),
            neighborhood=clean(d.get("neighborhood")),
            images=[u for u in (d.get("images") or []) if isinstance(u, str)],
            features=[f for f in (d.get("features") or []) if isinstance(f, str)],
        )
