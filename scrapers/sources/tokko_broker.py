"""Scraper base para inmobiliarias que usan Tokko Broker.

Tokko Broker es una plataforma SaaS para inmobiliarias argentinas.
Todas las páginas comparten la misma estructura HTML (listado y ficha).

Uso:
  1. Heredar de TokkoBrokerScraper.
  2. Configurar source, source_name, source_url y listings_url.
  3. Registrar en scrapers/sources/__init__.py.

No requiere Firecrawl ni API keys: parsea el HTML directamente.
"""

from __future__ import annotations

import html as html_mod
import logging
import re
from typing import Iterable
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from scrapers.base import BaseScraper
from scrapers.models import RawProperty
from scrapers.parsing import clean, parse_int, parse_price

log = logging.getLogger(__name__)

# Mapeo de tipos Tokko -> nuestros tipos normalizados
TOKKO_TYPE_MAP = {
    "departamento": "departamento",
    "casa": "casa",
    "ph": "ph",
    "terreno": "terreno",
    "local": "local",
    "galpón": "galpon",
    "galpon": "galpon",
    "oficina": "otro",
    "campo": "otro",
    "cochera": "otro",
    "depósito": "otro",
    "edificio": "otro",
}


class TokkoBrokerScraper(BaseScraper):
    """Scraper para un sitio inmobiliario basado en Tokko Broker.

    Configurar en subclase:
      listings_url  → URL de la página de listado (/Alquiler)
    """

    listings_url: str = ""

    # Tokko Broker no tiene paginación significativa (todo en una página).
    detail_delay: float = 0.3
    max_details: int = 300

    REQUEST_HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/125.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
    }

    TIMEOUT = 30

    # ---- HTTP helpers ------------------------------------------------

    def _fetch(self, url: str) -> str:
        resp = requests.get(
            url,
            headers=self.REQUEST_HEADERS,
            timeout=self.TIMEOUT,
        )
        resp.raise_for_status()
        return resp.text

    def _soup(self, url: str) -> BeautifulSoup:
        html = self._fetch(url)
        return BeautifulSoup(html, "html.parser")

    # ---- Listing parsing ---------------------------------------------

    def discover_listings(self) -> Iterable[tuple[str, str]]:
        # 1ra página: HTML completo con los primeros ~20 resultados
        html_first = self._fetch(self.listings_url)
        soup = BeautifulSoup(html_first, "html.parser")

        # Almacenar coordenadas de los markers JS para usarlas en parse_detail
        self._markers = self._parse_markers(soup)

        # Extraer query string para páginas siguientes (scroll infinito)
        next_page_qs = self._extract_next_page_qs(html_first)

        # Propiedades ya vistas (para no duplicar cuando iteramos páginas)
        seen: set[str] = set()

        # Extraer propiedades del HTML (primera página + siguientes)
        for item in self._parse_items(html_first):
            if item[0] not in seen:
                seen.add(item[0])
                yield item

        # Páginas siguientes vía AJAX (scroll infinito)
        if next_page_qs:
            page = 2
            while True:
                url = f"{self.listings_url}?{next_page_qs}&p={page}"
                fragment = self._fetch(url)
                if "--NoMoreProperties--" in fragment:
                    break
                items = self._parse_items(fragment)
                count = 0
                for item in items:
                    if item[0] not in seen:
                        seen.add(item[0])
                        yield item
                        count += 1
                if count == 0:
                    break
                page += 1

    def _parse_items(self, html: str) -> Iterable[tuple[str, str]]:
        """Parsea <li prop-id=""> del HTML de listado (fragmento o página completa)."""
        soup = BeautifulSoup(html, "html.parser")
        for li in soup.select("li[prop-id]"):
            prop_id = li.get("prop-id", "").strip()
            if not prop_id:
                continue
            a_tag = li.find("a")
            href = a_tag.get("href", "") if a_tag else ""
            url = urljoin(self.listings_url, href)
            yield prop_id, url

    def _parse_markers(self, soup: BeautifulSoup) -> dict[str, tuple[float, float]]:
        """Busca los add_new_marker(id, lat, lng) en los scripts del listado."""
        markers: dict[str, tuple[float, float]] = {}
        for script in soup.find_all("script"):
            text = script.string or ""
            for m in re.finditer(
                r"add_new_marker\(\s*'?(\d+)'?\s*,\s*([\d.-]+)\s*,\s*([\d.-]+)\s*\)",
                text,
            ):
                markers[m.group(1)] = (float(m.group(2)), float(m.group(3)))
        return markers

    def _extract_next_page_qs(self, html: str) -> str | None:
        """Busca la query string de la paginación AJAX en los scripts.

        Tokko Broker tiene JS inline con un .ajax() de jQuery que incluye
        un query string con todos los filtros. Extraemos esa query (sin el
        parámetro 'p=').
        """
        # Buscar el patrón: $.ajax('?...&p=')
        # La p= queda al final del string literal antes de cerrar comilla
        m = re.search(
            r"""\$\s*\.\s*ajax\s*\(\s*'([^']+?)p='""",
            html,
        )
        if m:
            url_str = m.group(1)
            if "?" in url_str:
                qs = url_str.split("?", 1)[1]
            else:
                qs = url_str
            qs = qs.rstrip("&")
            return qs
        return None

    # ---- Detail parsing ----------------------------------------------

    def parse_detail(self, url: str) -> RawProperty | None:
        try:
            soup = self._soup(url)
        except requests.RequestException as exc:
            log.warning("Error fetching %s: %s", url, exc)
            return None

        source_id = self._extract_id_from_url(url)

        prop = RawProperty(
            source=self.source,
            source_id=source_id,
            url=url,
        )

        # Coordenadas desde los markers del listado
        markers = getattr(self, "_markers", {})
        if source_id in markers:
            prop.lat, prop.lng = markers[source_id]

        # Imágenes
        prop.images = self._parse_images(soup)

        # Precio
        self._parse_price(soup, prop)

        # Título / dirección / ubicación
        self._parse_header(soup, prop)

        # Tipo de propiedad
        self._parse_type(soup, prop)

        # Info básica (baños, antigüedad, condición, etc.)
        self._parse_basic_info(soup, prop)

        # Superficies
        self._parse_surfaces(soup, prop)

        # Descripción
        self._parse_description(soup, prop)

        return prop

    def _extract_id_from_url(self, url: str) -> str:
        """Extrae el ID numérico de la URL tipo /p/12345-slug."""
        m = re.search(r"/p/(\d+)", url)
        return m.group(1) if m else url

    def _parse_images(self, soup: BeautifulSoup) -> list[str]:
        """Imágenes del slider de la ficha."""
        images: list[str] = []
        for img in soup.select("#ficha_slider .slides img"):
            src = img.get("src", "")
            if src and "no_image" not in src:
                images.append(src)
        return images

    def _parse_price(self, soup: BeautifulSoup, prop: RawProperty) -> None:
        """Precio desde el header de la ficha."""
        price_div = soup.select_one(".operation-val")
        if not price_div:
            return
        price_text = price_div.get_text(strip=True)
        amount, currency = parse_price(price_text)
        if currency == "USD":
            prop.price_usd = amount
            prop.currency = "USD"
        elif currency == "ARS":
            prop.price_ars = amount
            prop.currency = "ARS"

    def _parse_header(self, soup: BeautifulSoup, prop: RawProperty) -> None:
        """Dirección, ubicación y título."""
        address_el = soup.select_one(".title-address")
        if address_el:
            prop.address = clean(address_el.get_text(strip=True))

        # Título desde el OG title o el breadcrumb
        title_tag = soup.select_one("meta[property='og:title']")
        if title_tag:
            prop.title = clean(title_tag.get("content", ""))

        # Ubicación desde detalle
        loc_item = soup.select_one(".ficha_detalle_item:has(b:-soup-contains('Ubicación'))")
        if loc_item:
            text = loc_item.get_text(" ", strip=True)
            text = re.sub(r"^.*Ubicación\s*", "", text)
            prop.neighborhood = clean(text)

    def _parse_type(self, soup: BeautifulSoup, prop: RawProperty) -> None:
        """Tipo de propiedad desde el detalle."""
        type_item = soup.select_one(".ficha_detalle_item:has(b:-soup-contains('Tipo de Propiedad'))")
        if type_item:
            text = type_item.get_text(" ", strip=True)
            text = re.sub(r"^.*Tipo de Propiedad\s*", "", text)
            prop.property_type = self._map_type(text)
            if not prop.title:
                prop.title = text

    def _map_type(self, raw: str) -> str | None:
        if not raw:
            return None
        key = raw.strip().lower()
        return TOKKO_TYPE_MAP.get(key, "otro")

    def _parse_basic_info(self, soup: BeautifulSoup, prop: RawProperty) -> None:
        """Info básica: baños, ambientes, dormitorios, antigüedad, etc."""
        info_section = soup.select_one("#ficha_informacion_basica")
        if not info_section:
            return

        features: list[str] = []
        for li in info_section.select("li"):
            text = li.get_text(" ", strip=True)
            text = re.sub(r"^\s*[✓✔]\s*", "", text)

            # Baños
            if "baños" in text.lower() or "baño" in text.lower():
                prop.bathrooms = parse_int(text)
            # Dormitorios (a veces aparece como "suite" en Tokko)
            elif "dormitorio" in text.lower():
                prop.bedrooms = parse_int(text)
            # Ambientes (a veces "ambientes" en info)
            elif "ambiente" in text.lower():
                prop.rooms = parse_int(text)
            # Cochera / garage
            elif "cochera" in text.lower() or "garage" in text.lower() or "coch" in text.lower():
                val = parse_int(text)
                if val:
                    prop.garage = val
                else:
                    prop.garage = 1
            # Antigüedad
            elif "antigüedad" in text.lower() or "antiguedad" in text.lower():
                features.append(text)
            # Condición
            elif "condición" in text.lower() or "condicion" in text.lower():
                features.append(text)
            # Crédito
            elif "crédito" in text.lower() or "credito" in text.lower():
                features.append(text)
            # Todo lo demás va como característica
            else:
                cleaned = clean(text)
                if cleaned:
                    features.append(cleaned)

        prop.features = features

    def _parse_surfaces(self, soup: BeautifulSoup, prop: RawProperty) -> None:
        """Superficies: cubierta y total."""
        surf_section = soup.select_one("#ficha_superficies")
        if not surf_section:
            return

        for li in surf_section.select("li"):
            text = li.get_text(" ", strip=True)
            text = re.sub(r"^\s*[✓✔]\s*", "", text)
            lower = text.lower()

            if "cubierta" in lower:
                prop.area_covered = parse_int(text)
            elif "total" in lower:
                prop.area_total = parse_int(text)

    def _parse_description(self, soup: BeautifulSoup, prop: RawProperty) -> None:
        """Descripción desde la ficha."""
        desc_div = soup.select_one("#prop-desc")
        if desc_div:
            raw = desc_div.get_text(" ", strip=True)
            raw = html_mod.unescape(raw)
            raw = re.sub(r"<[^>]+>", " ", raw)
            prop.description = clean(raw)
