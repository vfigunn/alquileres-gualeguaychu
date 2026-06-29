"""Generación de slugs para URLs amigables (SEO).

Usado por los scrapers para generar el slug de cada propiedad a partir
de su título y dirección.
"""

from __future__ import annotations

import re
import unicodedata


def generate_slug(title: str | None, address: str | None, max_length: int = 100) -> str:
    """Genera un slug a partir del título y la dirección.

    Estrategia:
    1. Si hay título: se usa como base.
    2. Si hay dirección y NO está contenida en el título: se agrega.
    3. Se normaliza (sin acentos, minúsculas, solo alfanumérico).
    4. Se trunca a max_length.

    Ejemplos:
      generate_slug("Departamento en Alquiler - Rocamora al 100", "Rocamora al 100")
      → "departamento-en-alquiler-rocamora-al-100"  (dirección ya en título, no duplica)

      generate_slug("Casa con pileta", "Zona Norte")
      → "casa-con-pileta-zona-norte"
    """
    title_str = (title or "").strip().lower()
    address_str = (address or "").strip().lower()

    # Si la dirección ya está contenida en el título, no la repetimos
    if address_str and address_str in title_str:
        address_str = ""

    parts: list[str] = []
    if title_str:
        parts.append(title_str)
    if address_str:
        parts.append(address_str)

    if not parts:
        return "propiedad"

    raw = " - ".join(parts)

    # Normalizar unicode: separar acentos de caracteres base
    raw = unicodedata.normalize("NFKD", raw)
    # Eliminar diacríticos (acentos, ñ → n, etc.)
    raw = "".join(c for c in raw if not unicodedata.combining(c))

    # Pasar a minúsculas (por si no lo estaba ya)
    raw = raw.lower()

    # Reemplazar caracteres no alfanuméricos (excepto espacios y guiones) por nada
    raw = re.sub(r"[^a-z0-9\s-]", "", raw)
    # Reemplazar espacios y guiones múltiples por un solo guión
    raw = re.sub(r"[\s-]+", "-", raw)
    # Eliminar guiones al inicio y final
    raw = raw.strip("-")

    # Truncar a max_length, cortando en un guión si es posible
    if len(raw) > max_length:
        raw = raw[:max_length].rstrip("-")
        # Intentar cortar en un guión para no partir palabras
        last_hyphen = raw.rfind("-")
        if last_hyphen > max_length // 2:
            raw = raw[:last_hyphen]

    return raw or "propiedad"


def make_unique_slug(base_slug: str, existing_slugs: set[str]) -> str:
    """Asegura que el slug sea único agregando un sufijo numérico si es necesario.

    Ejemplo: si "casa-centro" ya existe → "casa-centro-2"
    """
    if base_slug not in existing_slugs:
        return base_slug

    counter = 2
    while f"{base_slug}-{counter}" in existing_slugs:
        counter += 1
    return f"{base_slug}-{counter}"
