"""Cliente delgado sobre la API de Firecrawl.

Usa la API REST directamente (sin SDK) para no depender de un paquete
extra y poder correr en cualquier runner con `requests`.

Variables de entorno:
  FIRECRAWL_API_KEY  -> obligatorio para correr scrapers reales.

Endpoints usados:
  POST /v1/scrape   -> extrae una URL a markdown o a JSON estructurado.
  POST /v1/map      -> lista URLs del sitio que matchean un patrón.

Docs: https://docs.firecrawl.dev
"""

from __future__ import annotations

import os
from typing import Optional

import requests

FIRECRAWL_BASE = "https://api.firecrawl.dev/v1"


class FirecrawlError(RuntimeError):
    pass


def _api_key() -> str:
    key = os.environ.get("FIRECRAWL_API_KEY")
    if not key:
        raise FirecrawlError(
            "Falta FIRECRAWL_API_KEY. Configurá el secreto en GitHub Actions "
            "(Settings > Secrets and variables > Actions)."
        )
    return key


def scrape(
    url: str,
    *,
    formats: list[str] | None = None,
    json_schema: Optional[dict] = None,
    prompt: Optional[str] = None,
    timeout_ms: int = 45000,
) -> dict:
    """Llama a POST /v1/scrape.

    - Sin `json_schema`: devuelve markdown/html según `formats`.
    - Con `json_schema` (y format 'json'): Firecrawl extrae campos
      estructurados con LLM. `prompt` ayuda a guiar la extracción.

    Devuelve el `data` del response.
    """
    formats = formats or (["json"] if json_schema else ["markdown"])
    payload: dict = {"url": url, "formats": formats, "timeout": timeout_ms}
    if json_schema:
        payload["jsonOptions"] = {"schema": json_schema, "prompt": prompt}

    resp = requests.post(
        f"{FIRECRAWL_BASE}/scrape",
        headers={
            "Authorization": f"Bearer {_api_key()}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=timeout_ms / 1000 + 10,
    )
    if resp.status_code >= 400:
        raise FirecrawlError(f"Firecrawl scrape {resp.status_code}: {resp.text[:300]}")
    body = resp.json()
    if not body.get("success", True):
        raise FirecrawlError(f"Firecrawl error: {body.get('error')}")
    return body.get("data", {})


def map_site(url: str, *, search: Optional[str] = None, limit: int = 200) -> list[str]:
    """Llama a POST /v1/map: devuelve URLs del sitio (opcionalmente filtradas)."""
    payload: dict = {"url": url, "limit": limit}
    if search:
        payload["search"] = search
    resp = requests.post(
        f"{FIRECRAWL_BASE}/map",
        headers={
            "Authorization": f"Bearer {_api_key()}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=60,
    )
    if resp.status_code >= 400:
        raise FirecrawlError(f"Firecrawl map {resp.status_code}: {resp.text[:300]}")
    body = resp.json()
    return body.get("links", []) or []
