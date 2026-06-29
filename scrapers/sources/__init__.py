"""Registro de fuentes habilitadas.

Para agregar una inmobiliaria nueva:
  1. Creá `scrapers/sources/mi_inmobiliaria.py` con una clase que
     herede de `BaseScraper`.
  2. Importala acá y sumala a `REGISTRY`.
  3. Listo. El orquestador la corre automáticamente.
"""

from scrapers.base import BaseScraper
from scrapers.sources.moussou import MoussouScraper
from scrapers.sources.ramirez_pedro import RamirezPedroScraper
from scrapers.sources.an_inmuebles import ANInmueblesScraper

# slug -> clase scraper. El slug debe coincidir con .source de la clase.
REGISTRY: dict[str, type[BaseScraper]] = {
    MoussouScraper.source: MoussouScraper,
    RamirezPedroScraper.source: RamirezPedroScraper,
    ANInmueblesScraper.source: ANInmueblesScraper,
}
