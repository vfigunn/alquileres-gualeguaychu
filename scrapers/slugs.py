"""Generación de slugs para URLs amigables (SEO).

Usado por los scrapers para generar el slug de cada propiedad a partir
de su título y dirección.
"""

from __future__ import annotations

import re
import unicodedata


def generate_slug(title: str | None, address: str | None, max_length: int = 100) -> str:
    """Genera un slug a partir del título y la dirección.

    Ejemplos:
      generate_slug("Departamento en Alquiler", "Rocamora al 100")
      → "departamento-en-alquiler-rocamora-al-100"

      generate_slug("Casa con pileta - Zona Norte", None)
      → "casa-con-pileta-zona-norte"

    Si ambos son None/vacíos, devuelve un slug genérico.
    """
    parts: list[str] = []

    if title and title.strip():
        parts.append(title.strip())
    if address and address.strip():
        parts.append(address.strip())

    if not parts:
        return "propiedad"

    raw = " - ".join(parts)

    # Normalizar unicode: separar acentos de caracteres base
    raw = unicodedata.normalize("NFKD", raw)
    # Eliminar diacríticos (acentos, ñ → n, etc.)
    raw = "".join(c for c in raw if not unicodedata.combining(c))

    # Pasar a minúsculas
    raw = raw.lower()

    # Reemplazar caracteres no alfanuméricos (excepto espacios) por guiones
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
