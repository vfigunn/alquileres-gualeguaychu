"""Utilidades de parseo compartidas por todos los scrapers.

Los listados de inmobiliarias son muy parecidos entre sí: precios con
símbolos de moneda, "2 dorm.", "80 m²", etc. Acá centralizamos las
expresiones regulares y normalizaciones para no repetir lógica.
"""

from __future__ import annotations

import re
from typing import Optional

# ---- IDs / URLs ----------------------------------------------------------

_URL_ID_PATTERNS = [
    # /propiedad/casa-en-calle-x-12345  ->  12345
    re.compile(r"-(\d{3,})(?:/?$|\?)"),
    # ?id=12345
    re.compile(r"[?&]id=(\d+)"),
    # /inmueble/12345
    re.compile(r"/(\d{4,})(?:/|$)"),
]


def id_from_url(url: str) -> str:
    """Trata de inferir un ID estable de la URL.

    Útil cuando el listado no expone un ID explícito y la única identidad
    estable es la URL. Si nada matchea, usa el path completo.
    """
    for pat in _URL_ID_PATTERNS:
        m = pat.search(url)
        if m:
            return m.group(1)
    return url.split("//")[-1].split("?", 1)[0].strip("/")


# ---- Precios -------------------------------------------------------------

_PRICE_RE = re.compile(r"([\d.,]+)")


def parse_price(text: Optional[str]) -> tuple[Optional[int], Optional[str]]:
    """Extrae (monto_entero, moneda) de un texto tipo 'U$S 320.000' o '$ 350.000'.

    Devuelve (None, None) si no hay nada. La moneda se deduce del símbolo:
      U$S / USD / US$  ->  'USD'
      $ / ARS          ->  'ARS'
    """
    if not text:
        return None, None
    t = text.strip()
    currency = None
    if re.search(r"\b(u?s\$s|usd|u\$s|us\$)\b", t, re.IGNORECASE):
        currency = "USD"
    elif "$" in t or re.search(r"\bars\b", t, re.IGNORECASE):
        currency = "ARS"
    m = _PRICE_RE.search(t.replace("\xa0", " "))
    if not m:
        return None, currency
    amount = m.group(1).replace(".", "").replace(",", "")
    if not amount.isdigit():
        return None, currency
    return int(amount), currency


def parse_int(text: Optional[str]) -> Optional[int]:
    """Extrae el primer entero de un texto tipo '2 dorm.' o '80 m²'."""
    if text is None:
        return None
    m = re.search(r"\d+", str(text).replace(".", ""))
    return int(m.group()) if m else None


# ---- Tipos de propiedad --------------------------------------------------

_TYPE_MAP = {
    "casa": "casa",
    "casas": "casa",
    "departamento": "departamento",
    "departamentos": "departamento",
    "depto": "departamento",
    "dpto": "departamento",
    "ph": "ph",
    "terreno": "terreno",
    "lote": "terreno",
    "local": "local",
    "galpon": "galpon",
    "cochera": "otro",
}


def normalize_type(text: Optional[str]) -> Optional[str]:
    if not text:
        return None
    key = re.sub(r"[^a-záéíóúñ]", "", str(text).lower())
    return _TYPE_MAP.get(key, "otro")


# ---- Texto ---------------------------------------------------------------


def clean(text: Optional[str]) -> Optional[str]:
    """Colapsa espacios y recorta. Devuelve None si queda vacío."""
    if text is None:
        return None
    s = re.sub(r"\s+", " ", str(text)).strip()
    return s or None
