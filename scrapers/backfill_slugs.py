"""Backfill: genera slugs para todas las propiedades existentes en Supabase.

Uso:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python backfill_slugs.py

Ejecutar UNA SOLA VEZ después de agregar la columna `slug` en Supabase.
"""

import os
import sys
import re
import unicodedata
import requests

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
API_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
HEADERS = {
    "apikey": API_KEY,
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}


def generate_slug(title: str | None, address: str | None, max_length: int = 100) -> str:
    parts: list[str] = []
    if title and title.strip():
        parts.append(title.strip())
    if address and address.strip():
        parts.append(address.strip())
    if not parts:
        return "propiedad"

    raw = " - ".join(parts)
    raw = unicodedata.normalize("NFKD", raw)
    raw = "".join(c for c in raw if not unicodedata.combining(c))
    raw = raw.lower()
    raw = re.sub(r"[^a-z0-9\s-]", "", raw)
    raw = re.sub(r"[\s-]+", "-", raw)
    raw = raw.strip("-")

    if len(raw) > max_length:
        raw = raw[:max_length].rstrip("-")
        last_hyphen = raw.rfind("-")
        if last_hyphen > max_length // 2:
            raw = raw[:last_hyphen]

    return raw or "propiedad"


def main():
    print("🔍 Obteniendo propiedades sin slug...")

    # Obtener todas las propiedades (sin slug o con slug NULL)
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/properties"
        f"?select=id,title,address,source,source_id"
        f"&order=id.asc",
        headers=HEADERS,
        timeout=60,
    )
    r.raise_for_status()
    props = r.json()
    print(f"   {len(props)} propiedades encontradas")

    # Consultar slugs ya existentes para evitar duplicados
    r2 = requests.get(
        f"{SUPABASE_URL}/rest/v1/properties?select=slug",
        headers=HEADERS,
        timeout=30,
    )
    if r2.status_code >= 400:
        print(f"   ⚠️  No se pudieron obtener slugs existentes: {r2.status_code}")
        existing_slugs = set()
    else:
        existing_slugs = {row["slug"] for row in r2.json() if row.get("slug")}
    print(f"   {len(existing_slugs)} slugs ya existentes")

    updated = 0
    for p in props:
        base = generate_slug(p.get("title"), p.get("address"))
        slug = base
        counter = 2
        while slug in existing_slugs:
            slug = f"{base}-{counter}"
            counter += 1
        existing_slugs.add(slug)

        # PATCH solo el slug
        r = requests.patch(
            f"{SUPABASE_URL}/rest/v1/properties"
            f"?source=eq.{p['source']}"
            f"&source_id=eq.{p['source_id']}",
            headers={**HEADERS, "Prefer": "return=minimal"},
            json={"slug": slug},
            timeout=15,
        )
        if r.status_code >= 400:
            print(f"   ❌ {p['source']}/{p['source_id']}: {r.status_code} {r.text[:100]}")
        else:
            updated += 1
            if updated % 20 == 0:
                print(f"   ✅ {updated}/{len(props)} actualizadas...")

    print(f"\n✅ {updated} propiedades actualizadas con slug")


if __name__ == "__main__":
    main()
