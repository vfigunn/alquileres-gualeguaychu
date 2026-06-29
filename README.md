# Alquileres Gualeguaychú

Agregador de alquileres de la ciudad de Gualeguaychú. Recorre a diario los
sitios de las inmobiliarias con scrapers (Python + Firecrawl), normaliza los
datos, los guarda en SQLite, y los publica en un sitio estático hecho con
NextJS.

> Estado: **sin branding todavía** (logo/identidad pendientes). La paleta y
> el placeholder "AG" en el header son provisorios.

---

## Arquitectura (resumen)

```
   GitHub Actions (cron diario)
            │
            ▼
   python -m scrapers.run          ← scrapers (Firecrawl)
            │
            ▼
   data/alquileres.db  (SQLite)    ← dedup por (source, source_id)
            │  git commit + push (si hubo cambios)
            ▼
   Deploy automático               ← Vercel / Netlify / Pages
            │
            ▼
   npm run build
     ├─ prebuild: lib/build-data.mjs  →  public/data/*.json
     └─ next build (output: export)   →  out/  (HTML estático)
```

El SQLite **se commitea al repo** (es el estado compartido entre el runner
efímero de Actions y el build del sitio). El sitio **solo lo lee** en
build-time para generar JSON estático; nunca lo abre en runtime.

---

## Puesta en marcha (desarrollo)

Requisitos: Node 20+, Python 3.11+.

```bash
npm install
npm run db:seed        # crea data/alquileres.db con datos de ejemplo
npm run dev            # http://localhost:3000
```

Scripts útiles:

| Script                | Qué hace                                              |
| --------------------- | ----------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo                                 |
| `npm run build`       | Genera `public/data/*.json` y compila a `out/`         |
| `npm run db:init`     | Crea la DB vacía (sin datos)                           |
| `npm run db:seed`     | Crea la DB + carga 4 propiedades de ejemplo            |

Para correr los scrapers en local (requiere API key):

```bash
pip install -r requirements.txt
export FIRECRAWL_API_KEY=fc-...
python -m scrapers.run                 # todas las fuentes
python -m scrapers.run sources=example # solo una
python -m scrapers.run --list          # ver fuentes disponibles
```

---

## Configuración en GitHub

### Secreto obligatorio

**Settings → Secrets and variables → Actions → New repository secret:**

- `FIRECRAWL_API_KEY` → tu API key de [firecrawl.dev](https://firecrawl.dev).

Sin ese secreto, los scrapers fallan (no rompen el sitio: el deploy sigue
publicando el último estado conocido).

### Permisos del workflow

`.github/workflows/scrape-and-deploy.yml` necesita `contents: write` (ya
configurado) para que el bot pueda commitear la DB actualizada.

### Deploy

El sitio se exporta a `out/` con `output: export`. Cualquier host estático
sirve:

- **Vercel / Netlify**: importar el repo, framework NextJS, build command
  `npm run build`, output `out`. El push con la DB nueva dispara el
  redeploy automáticamente.
- **GitHub Pages**: hacer un step extra en el workflow que publique `out/`.

---

## Cómo agregar una inmobiliaria (fuente nueva)

Cada fuente es una clase que hereda de `BaseScraper` e implementa dos
métodos. Hay una plantilla completa en
[`scrapers/sources/example_inmobiliaria.py`](scrapers/sources/example_inmobiliaria.py).

1. **Crear el scraper**: `scrapers/sources/mi_inmobiliaria.py`

   ```python
   from scrapers.base import BaseScraper
   from scrapers.models import RawProperty
   from scrapers import firecrawl_client as fc
   from scrapers.parsing import id_from_url, parse_price, parse_int

   class MiInmobiliariaScraper(BaseScraper):
       source = "mi-inmobiliaria"            # slug único y estable
       source_name = "Inmobiliaria X"
       source_url = "https://www.inmobiliaria-x.com.ar"

       def discover_listings(self):
           links = fc.map_site("https://www.inmobiliaria-x.com.ar/alquileres")
           for url in links:
               if "/propiedad" in url:
                   yield id_from_url(url), url

       def parse_detail(self, url):
           d = fc.scrape(url, json_schema=MI_SCHEMA).get("json", {})
           monto, moneda = parse_price(d.get("price"))
           return RawProperty(
               source=self.source,
               source_id=id_from_url(url),
               url=url,
               title=d.get("title"),
               price_ars=monto if moneda == "ARS" else None,
               price_usd=monto if moneda == "USD" else None,
               currency=moneda,
               bedrooms=parse_int(d.get("bedrooms")),
               # ... el resto de campos
           )
   ```

2. **Registrarla** en `scrapers/sources/__init__.py`:

   ```python
   from scrapers.sources.mi_inmobiliaria import MiInmobiliariaScraper
   REGISTRY[MiInmobiliariaScraper.source] = MiInmobiliariaScraper
   ```

3. **Probar** localmente y luego pushear. El próximo cron la incluye sola.

> **Importante — deduplicación**: el `source_id` debe ser el ID **estable**
> que esa propiedad tiene en el sitio original (un ID numérico, o derivado
> de la URL si la URL no cambia). Si dos corridas ven la misma propiedad
> con distinto `source_id`, se duplica. El helper `id_from_url` cubre los
> patrones más comunes; ajustalo si la fuente usa otro formato.

---

## Modelo de datos

Definido en [`lib/schema.sql`](lib/schema.sql) (compartido por Node y
Python). Tablas:

- `sources` — catálogo de inmobiliarias (slug, nombre, url).
- `properties` — las propiedades. UNIQUE `(source, source_id)` para dedup.
- `scrape_runs` — historial de cada corrida (auditoría).
- `removed_properties` — publicaciones que ya no están en el sitio original.

Campos destacados de `properties`:

- `featured` (0/1) — destacada manual. El admin lo prende; las destacadas
  aparecen primero en el buscador.
- `hidden` (0/1) — no se publica en el sitio (moderación).
- `first_seen_at` / `last_seen_at` — ciclo de vida de la publicación.
- `images_json` / `features_json` — arrays serializados (URLs externas,
  no se descargan).

---

## Migración a Supabase (futura)

El diseño está pensado para migrar sin reescribir:

1. Crear las mismas tablas en Postgres (el `schema.sql` es casi 1:1).
2. Cambiar `scrapers/db.py` para usar `psycopg`/Supabase en vez de
   `sqlite3`. Las queries son SQL estándar.
3. Cambiar `lib/build-data.mjs` (o pasar a fetch directo) para leer de
   Supabase en build-time. El frontend no cambia: sigue consumiendo JSON.
4. Cuando quieras datos en vivo (sin rebuild), conectar el frontend
   directo a la API de Supabase.

---

## Notas y pendientes

- **Branding**: sin logo ni paleta definitiva. Ver `tailwind.config.ts`
  (`colors.brand`) y el placeholder "AG" en `app/layout.tsx`.
- **Destacados**: hoy se manejan editando la DB (`UPDATE properties SET
  featured=1 WHERE id=...`). Falta un panel admin mínimo.
- **Mapa**: el schema guarda `lat`/`lng` pero el sitio aún no muestra mapa.
- **Seguridad**: `next@14.2.35` y `better-sqlite3` quedaron con dos
  advisories transitivos (postcss XSS en stringify, no aplica a este
  caso de uso estático). Subir a Next 16 cuando se estabilice el panel
  admin.

## Estructura del proyecto

```
.
├── app/                      # Frontend NextJS (App Router)
│   ├── layout.tsx            # header/footer + nav
│   ├── page.tsx              # home = buscador
│   ├── propiedad/[id]/       # ficha de propiedad (SSG)
│   └── como-funciona/
├── components/
│   ├── PropertyCard.tsx
│   └── SearchPage.tsx        # filtros + resultados (client)
├── lib/                      # Node: schema, build de datos, tipos
│   ├── schema.sql
│   ├── build-data.mjs        # DB → public/data/*.json
│   ├── init-db.mjs / seed-data.mjs
│   ├── types.ts / format.ts / filters.ts
├── scrapers/                 # Python
│   ├── run.py                # entrypoint (lo llama Actions)
│   ├── base.py               # BaseScraper (dedup, runs)
│   ├── db.py                 # acceso SQLite + upsert
│   ├── firecrawl_client.py
│   ├── parsing.py            # helpers (precio, m², tipo, ID)
│   ├── models.py             # RawProperty
│   └── sources/              # un .py por inmobiliaria
├── data/alquileres.db        # estado (commiteada)
├── .github/workflows/        # cron diario + commit + deploy
└── next.config.mjs           # output: export
```
