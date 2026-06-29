"""Cliente delgado de Supabase para los scrapers.

Usa la REST API de PostgREST (lo que Supabase expone) con la
service_role key para tener permisos de escritura. Sin dependencias
extra — solo `requests` que ya está en requirements.txt.

API usada:
  - GET  /rest/v1/sources          -> listar fuentes
  - POST /rest/v1/sources          -> insertar fuente
  - POST /rest/v1/properties       -> upsert (con on_conflict)
  - POST /rest/v1/scrape_runs      -> insertar run
  - PATCH /rest/v1/scrape_runs     -> actualizar run
  - POST /rest/v1/removed_properties -> registrar bajas

Variables de entorno:
  SUPABASE_URL                -> https://xxxxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY   -> JWT con rol service_role
"""

from __future__ import annotations

import json
import os
from typing import Optional

import requests

from .slugs import generate_slug


class SupabaseError(RuntimeError):
    pass


def datetime_now_iso() -> str:
    """Timestamp UTC en formato ISO 8601."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def _url() -> str:
    u = os.environ.get("SUPABASE_URL", "")
    if not u:
        raise SupabaseError("Falta SUPABASE_URL en entorno")
    return u.rstrip("/")


def _headers() -> dict:
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not key:
        raise SupabaseError("Falta SUPABASE_SERVICE_ROLE_KEY en entorno")
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


# ── sources ────────────────────────────────────────────────────────

def ensure_source(slug: str, name: str, url: str) -> None:
    """Registra la fuente si no existe (INSERT … ON CONFLICT DO NOTHING)."""
    # Verificamos si ya existe
    r = requests.get(
        f"{_url()}/rest/v1/sources?slug=eq.{slug}&select=slug",
        headers=_headers(),
        timeout=15,
    )
    r.raise_for_status()
    if r.json():
        return  # ya existe

    body = {"slug": slug, "name": name, "url": url, "enabled": True}
    r = requests.post(
        f"{_url()}/rest/v1/sources",
        headers={**_headers(), "Prefer": "return=minimal"},
        json=body,
        timeout=15,
    )
    if r.status_code >= 400:
        raise SupabaseError(f"ensure_source({slug}): {r.status_code} {r.text[:300]}")


# ── properties ─────────────────────────────────────────────────────

def upsert_property(prop_dict: dict) -> str:
    """Inserta o actualiza una propiedad en Supabase.

    `prop_dict` es el dict de RawProperty.to_db_row() (ya con images_json,
    features_json, source, source_id, url, etc.).

    En INSERT genera un slug único a partir de title + address.
    En UPDATE no modifica el slug (URLs estables).

    Devuelve 'new' | 'updated'.
    """
    # Verificar si ya existe para saber si es new o updated
    r = requests.get(
        f"{_url()}/rest/v1/properties"
        f"?source=eq.{prop_dict['source']}"
        f"&source_id=eq.{prop_dict['source_id']}"
        f"&select=id,slug",
        headers=_headers(),
        timeout=15,
    )
    r.raise_for_status()
    existing_rows = r.json()
    is_new = len(existing_rows) == 0

    if is_new:
        # INSERT: generar slug y asegurar unicidad
        base_slug = generate_slug(
            prop_dict.get("title"),
            prop_dict.get("address"),
        )
        slug = _ensure_unique_slug(base_slug)

        body = {k: v for k, v in prop_dict.items() if v is not None}
        body["slug"] = slug
        r = requests.post(
            f"{_url()}/rest/v1/properties",
            headers={**_headers(), "Prefer": "return=minimal"},
            json=body,
            timeout=15,
        )
    else:
        # UPDATE: solo campos mutables, sin tocar first_seen_at ni slug
        mutable = {
            "url": prop_dict.get("url"),
            "title": prop_dict.get("title"),
            "description": prop_dict.get("description"),
            "price_ars": prop_dict.get("price_ars"),
            "price_usd": prop_dict.get("price_usd"),
            "currency": prop_dict.get("currency"),
            "expenses_ars": prop_dict.get("expenses_ars"),
            "property_type": prop_dict.get("property_type"),
            "bedrooms": prop_dict.get("bedrooms"),
            "bathrooms": prop_dict.get("bathrooms"),
            "area_total": prop_dict.get("area_total"),
            "area_covered": prop_dict.get("area_covered"),
            "garage": prop_dict.get("garage", 0),
            "rooms": prop_dict.get("rooms"),
            "address": prop_dict.get("address"),
            "neighborhood": prop_dict.get("neighborhood"),
            "lat": prop_dict.get("lat"),
            "lng": prop_dict.get("lng"),
            "images_json": prop_dict.get("images_json", []),
            "features_json": prop_dict.get("features_json", []),
            "published_at": prop_dict.get("published_at"),
            "last_seen_at": datetime_now_iso(),
            "hidden": False,  # reactivar si estaba oculta
        }
        body = {k: v for k, v in mutable.items() if v is not None}
        r = requests.patch(
            f"{_url()}/rest/v1/properties"
            f"?source=eq.{prop_dict['source']}"
            f"&source_id=eq.{prop_dict['source_id']}",
            headers={**_headers(), "Prefer": "return=minimal"},
            json=body,
            timeout=15,
        )

    if r.status_code >= 400:
        raise SupabaseError(
            f"upsert_property({prop_dict.get('source')}/{prop_dict.get('source_id')}): "
            f"{r.status_code} {r.text[:300]}"
        )

    return "new" if is_new else "updated"


def _ensure_unique_slug(base_slug: str) -> str:
    """Verifica que el slug no exista ya en Supabase. Si existe, le agrega
    un sufijo numérico (-2, -3, ...)."""
    r = requests.get(
        f"{_url()}/rest/v1/properties"
        f"?slug=eq.{base_slug}"
        f"&select=slug",
        headers=_headers(),
        timeout=10,
    )
    r.raise_for_status()
    existing = {row["slug"] for row in r.json()}

    if base_slug not in existing:
        return base_slug

    counter = 2
    while f"{base_slug}-{counter}" in existing:
        counter += 1
    return f"{base_slug}-{counter}"


# ── scrape_runs ────────────────────────────────────────────────────

def start_run(source: str) -> int:
    """Crea un registro de ejecución y devuelve su ID."""
    now = datetime_now_iso()
    body = {
        "source": source,
        "started_at": now,
        "found_count": 0,
        "new_count": 0,
        "updated_count": 0,
    }
    r = requests.post(
        f"{_url()}/rest/v1/scrape_runs",
        headers={**_headers(), "Prefer": "return=representation"},
        json=body,
        timeout=15,
    )
    if r.status_code >= 400:
        raise SupabaseError(f"start_run({source}): {r.status_code} {r.text[:300]}")
    data = r.json()
    return data[0]["id"] if isinstance(data, list) else data["id"]


def finish_run(
    run_id: int,
    *,
    status: str,
    found: int = 0,
    new: int = 0,
    updated: int = 0,
    error: Optional[str] = None,
) -> None:
    now = datetime_now_iso()
    body = {
        "finished_at": now,
        "status": status,
        "found_count": found,
        "new_count": new,
        "updated_count": updated,
        "error": error,
    }
    r = requests.patch(
        f"{_url()}/rest/v1/scrape_runs?id=eq.{run_id}",
        headers={**_headers(), "Prefer": "return=minimal"},
        json=body,
        timeout=15,
    )
    if r.status_code >= 400:
        raise SupabaseError(f"finish_run({run_id}): {r.status_code} {r.text[:300]}")


# ── removed_properties ─────────────────────────────────────────────

def mark_unseen_as_removed(source: str, seen_ids: list[str], *, total_found: int = 0, max_details: int = 200) -> int:
    """Marca propiedades no encontradas como hidden=true + registra en removed_properties.

    Solo actúa si se procesaron TODOS los listings (total_found <= max_details).
    Si el scraper encontró más propiedades de las que procesa, no oculta nada
    para evitar falsos positivos.
    """
    if not seen_ids:
        return 0

    # Seguridad: si no procesamos todos los listings, no marcar como removidas
    if total_found > max_details:
        return 0

    # Obtener todas las propiedades actuales de esta fuente
    r = requests.get(
        f"{_url()}/rest/v1/properties"
        f"?source=eq.{source}"
        f"&select=source_id,url,title",
        headers=_headers(),
        timeout=30,
    )
    r.raise_for_status()
    all_props = r.json()

    seen = set(seen_ids)
    removed = [p for p in all_props if p["source_id"] not in seen]
    if not removed:
        return 0

    now = datetime_now_iso()

    for p in removed:
        # 1. Registrar en removed_properties (auditoría)
        body = {
            "source": source,
            "source_id": p["source_id"],
            "url": p.get("url", ""),
            "title": p.get("title", ""),
            "removed_at": now,
        }
        r = requests.post(
            f"{_url()}/rest/v1/removed_properties"
            f"?on_conflict=source,source_id",
            headers={**_headers(), "Prefer": "resolution=merge-duplicates"},
            json=body,
            timeout=15,
        )
        if r.status_code >= 400:
            raise SupabaseError(
                f"mark_unseen_as_removed({source}/{p['source_id']}): "
                f"{r.status_code} {r.text[:300]}"
            )

        # 2. Ocultar la propiedad (hidden = true) → no se muestra en el sitio
        r2 = requests.patch(
            f"{_url()}/rest/v1/properties"
            f"?source=eq.{source}"
            f"&source_id=eq.{p['source_id']}",
            headers={**_headers(), "Prefer": "return=minimal"},
            json={"hidden": True},
            timeout=15,
        )
        if r2.status_code >= 400:
            raise SupabaseError(
                f"ocultar({source}/{p['source_id']}): "
                f"{r2.status_code} {r2.text[:300]}"
            )

    return len(removed)


# ── stats ──────────────────────────────────────────────────────────

def counts() -> dict:
    """Devuelve conteos rápidos de propiedades y fuentes."""
    r_props = requests.get(
        f"{_url()}/rest/v1/properties?select=count",
        headers={**_headers(), "Prefer": "count=exact"},
        timeout=15,
    )
    r_sources = requests.get(
        f"{_url()}/rest/v1/sources?select=count",
        headers={**_headers(), "Prefer": "count=exact"},
        timeout=15,
    )
    return {
        "properties": int(r_props.headers.get("content-range", "0").split("/")[-1]),
        "sources": int(r_sources.headers.get("content-range", "0").split("/")[-1]),
    }
