# Alquileres Gualeguaychú

Agregador de alquileres de la ciudad de **Gualeguaychú, Entre Ríos**. Recorre a diario los sitios de las inmobiliarias con scrapers (Python + Firecrawl), normaliza los datos, los guarda en **Supabase** y los publica en un sitio web dinámico con **Next.js 14** desplegado en **Vercel**.

> 🔗 **Sitio en producción:** [alquileresgualeguaychu.vercel.app](https://alquileresgualeguaychu.vercel.app)

---

## Arquitectura

```
 GitHub Actions (cron 08:00 UTC)
           │
           ▼
  python -m scrapers.run          ← scrapers Python + Firecrawl
           │
           ▼
  Supabase (PostgreSQL)           ← REST vía supabase_client.py
           │
           ▼
  Next.js (ISR + CSR)             ← App Router, fetch directo a Supabase
           │
           ▼
  Vercel                          ← deploy automático desde GitHub
```

- Los scrapers corren en GitHub Actions y escriben directo a Supabase vía PostgREST.
- El frontend usa **ISR** (revalidate cada 6h) para las páginas de detalle y **CSR** para el buscador (filtros, paginación).
- No se commitea base de datos al repo; el estado vive en Supabase.

---

## Stack

| Capa       | Tecnología                                    |
| ---------- | --------------------------------------------- |
| Frontend   | Next.js 14 (App Router), Tailwind CSS, TypeScript |
| Backend    | Supabase (PostgreSQL + REST API)              |
| Scrapers   | Python 3.11+, Firecrawl API                   |
| Search     | Filtros por tipo, precio, barrio; ordenamiento |
| SEO        | sitemap.xml dinámico, robots.txt, JSON-LD (RealEstateListing), OpenGraph, metadatos |
| Deploy     | Vercel (auto desde GitHub)                    |
| CI/CD      | GitHub Actions (scrape diario + secrets)      |

---

## Funcionalidades

- **Buscador** de propiedades con filtros por tipo (casa, departamento, ph, terreno, local, galpón), precio, barrio y texto libre.
- **Ordenamiento** por relevancia, precio (asc/desc) y más recientes.
- **Páginas de detalle** con galería de imágenes, especificaciones, descripción, características y sidebar con datos de la inmobiliaria.
- **URLs SEO-friendly** con slugs generados automáticamente desde título y dirección.
- **Rich snippets** en Google mediante JSON-LD (RealEstateListing schema).
- **Sitemap XML** dinámico que indexa todas las propiedades.
- **Soft-delete** de propiedades: cuando una publicación desaparece del sitio original se marca como `hidden=true`; si reaparece se reactiva automáticamente.
- **Detección de scraping parcial** con protección: no oculta propiedades si se procesaron menos listings de los que existen (evita falsos positivos).
- **Diseño responsive** con menú mobile, overlay de filtros en móvil, y sidebar desktop sticky.
- **Robots.txt** optimizado para crawlers.

---

## Puesta en marcha (desarrollo)

```bash
# Requisitos: Node 20+, Python 3.11+

# Instalar dependencias del frontend
npm install

# Iniciar servidor de desarrollo
npm run dev                 # http://localhost:3000

# Build estático (genera public/data/*.json para modo static export)
npm run build
```

### Scrapers en local

```bash
pip install -r requirements.txt

# Configurar variables de entorno
export FIRECRAWL_API_KEY=fc-...
export SUPABASE_URL=https://tu-proyecto.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=clave_service_role

# Ejecutar scrapers
python -m scrapers.run                   # todas las fuentes
python -m scrapers.run sources=an-inmuebles  # solo una fuente
python -m scrapers.run --list            # listar fuentes disponibles
```

---

## Scripts disponibles

| Script                | Qué hace                                          |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo                             |
| `npm run build`       | Build de producción (prebuild + next build)        |
| `node lib/build-data.mjs` | Genera JSON estático desde Supabase (build-time) |

---

## Estructura del proyecto

```
.
├── app/                          # Frontend Next.js (App Router)
│   ├── layout.tsx                # Layout global: SEO meta, JSON-LD, nav, footer
│   ├── page.tsx                  # Home = buscador (client component)
│   ├── robots.ts                 # robots.txt dinámico
│   ├── sitemap.ts                # sitemap.xml dinámico (propiedades + estáticas)
│   ├── propiedad/[slug]/         # Página de detalle con ISR (revalidate 6h)
│   ├── como-funciona/
│   ├── contacto/
│   ├── cookies/
│   ├── privacidad/
│   └── terminos/
├── components/
│   ├── TopNavBar.tsx             # Navbar responsive mobile/desktop
│   ├── SearchPage.tsx            # Buscador con filtros + grid + paginación
│   ├── PropertyCard.tsx          # Card de propiedad en grid
│   ├── PropertyGallery.tsx       # Galería de imágenes en detalle
│   ├── FilterContent.tsx         # Panel de filtros (mobile overlay + desktop sidebar)
│   └── ContactForm.tsx           # Formulario de contacto
├── lib/                          # Lógica compartida (Node)
│   ├── supabase.ts               # Cliente Supabase (anon key para el frontend)
│   ├── types.ts                  # Tipos TypeScript (Property, Source)
│   ├── format.ts                 # Formateo: precios, specs, descripción
│   ├── filters.ts                # Lógica de filtros y facetas
│   ├── schema-supabase.sql       # Schema SQL para Supabase
│   ├── schema.sql                # Schema SQLite (legacy / local dev)
│   ├── build-data.mjs            # Genera JSON estático desde DB local
│   ├── fallback-data.ts          # Datos de respaldo para build
│   ├── init-db.mjs               # Inicializa DB SQLite local
│   └── seed-data.mjs             # Datos de ejemplo para DB local
├── scrapers/                     # Scrapers Python
│   ├── run.py                    # Entrypoint (lo llama GitHub Actions)
│   ├── base.py                   # BaseScraper con ciclo completo
│   ├── supabase_client.py        # Cliente REST contra Supabase PostgREST
│   ├── slugs.py                  # Generación de slugs SEO-friendly
│   ├── backfill_slugs.py         # Script one-shot para regenerar slugs
│   ├── db.py                     # Acceso SQLite (legacy)
│   ├── firecrawl_client.py       # Cliente Firecrawl (scrape + map + search)
│   ├── models.py                 # RawProperty con to_db_row()
│   └── sources/                  # Un .py por inmobiliaria
├── public/
│   ├── ag-logo-horizontal*.png   # Logos
│   └── data/                     # JSON generado en build-time
├── .github/workflows/
│   └── scrape-and-deploy.yml     # Cron diario + scrape + deploy
└── tailwind.config.ts            # Configuración de diseño (colores, espaciado, tipografía)
```

---

## Diseño visual

- **Paleta:** Fondo claro (`#f7f9fb`), texto oscuro, acentos en dorado (`#D4AF37`)
- **Tipografía:** EB Garamond (títulos), Manrope (texto y etiquetas)
- **Layout:** Contenedor max 1280px, gutter 24px, responsive desde mobile
- **Footer:** Fondo navy oscuro (`#0a1b2c`), texto blanco/azul claro

---

## SEO implementado

| Elemento               | Detalle                                       |
| ---------------------- | --------------------------------------------- |
| **robots.txt**         | Permite crawleo, bloquea `/api/` y legales    |
| **sitemap.xml**        | Dinámico: propiedades + páginas estáticas     |
| **JSON-LD (home)**     | Schema RealEstateAgent                        |
| **JSON-LD (prop)**     | Schema RealEstateListing (precio, direc, m²)  |
| **OpenGraph**          | title, description, image, url, type          |
| **Twitter Cards**      | summary_large_image                           |
| **Canonical URLs**     | Por página y propiedad                        |
| **Metadatos**          | Title template, description, keywords, author |

---

## Modelo de datos (Supabase)

### Tabla `sources`
| Campo     | Tipo     | Descripción                    |
| --------- | -------- | ------------------------------ |
| slug      | text PK  | Identificador único            |
| name      | text     | Nombre de la inmobiliaria      |
| url       | text     | URL del sitio original         |
| enabled   | boolean  | Activo para scraping           |

### Tabla `properties`
| Campo           | Tipo      | Descripción                              |
| --------------- | --------- | ---------------------------------------- |
| id              | uuid PK   | ID único                                 |
| source          | text FK   | Slug de la inmobiliaria                  |
| source_id       | text      | ID en el sitio original (stable)         |
| slug            | text UNIQUE | Slug SEO-friendly (generado)           |
| title           | text      | Título de la publicación                 |
| description     | text      | Descripción detallada                    |
| price_ars       | numeric   | Precio en ARS                            |
| price_usd       | numeric   | Precio en USD                            |
| currency        | text      | Moneda                                   |
| expenses_ars    | numeric   | Expensas en ARS                          |
| property_type   | text      | Tipo: casa, departamento, ph, etc.       |
| bedrooms        | integer   | Dormitorios                              |
| bathrooms       | integer   | Baños                                    |
| area_total      | numeric   | Superficie total (m²)                    |
| area_covered    | numeric   | Superficie cubierta (m²)                 |
| garage          | integer   | Cocheras                                 |
| rooms           | integer   | Ambientes                                |
| address         | text      | Dirección                                |
| neighborhood    | text      | Barrio                                   |
| lat/lng         | numeric   | Coordenadas geográficas                  |
| images_json     | jsonb     | Array de URLs de imágenes                |
| features_json   | jsonb     | Array de características                 |
| featured        | boolean   | Destacada                                |
| hidden          | boolean   | Oculta (soft-delete)                     |
| url             | text      | URL original                             |
| first_seen_at   | timestamptz | Primera vez detectada                  |
| last_seen_at    | timestamptz | Última vez detectada                   |
| published_at    | timestamptz | Fecha de publicación original          |

UNIQUE `(source, source_id)` para deduplicación.

### Tabla `scrape_runs`
Historial de ejecuciones del scraper (inicio, fin, propiedades encontradas, estado).

### Tabla `removed_properties`
Registro de propiedades que desaparecieron del sitio original (para auditoría).

---

## Cómo agregar una fuente nueva

Cada fuente es una clase que hereda de `BaseScraper` e implementa dos métodos. Hay una plantilla en [`scrapers/sources/example_inmobiliaria.py`](scrapers/sources/example_inmobiliaria.py).

1. **Crear el scraper:** `scrapers/sources/mi_inmobiliaria.py`
2. **Registrarlo** en `scrapers/sources/__init__.py`
3. **Probar** localmente y pushear. El próximo cron la incluye automáticamente.

> **Deduplicación:** el `source_id` debe ser el ID estable que esa propiedad tiene en el sitio original. Si cambia entre corridas, la propiedad se duplica.

---

## Configuración de GitHub Actions

### Secrets requeridos

| Secret                    | Descripción                          |
| ------------------------- | ------------------------------------ |
| `FIRECRAWL_API_KEY`       | API key de Firecrawl                 |
| `SUPABASE_URL`            | URL del proyecto Supabase            |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (permisos de escritura) |

### Workflow

El archivo `.github/workflows/scrape-and-deploy.yml`:
- Se ejecuta diariamente a las **08:00 UTC** (05:00 ARG)
- También se puede disparar manualmente desde la UI de Actions
- Corre los scrapers, escribe a Supabase, y despliega automáticamente a Vercel

---

## Deploy

El deploy se realiza a **Vercel** automáticamente con cada push a `main` (integración GitHub).

- Páginas dinámicas (API routes, detalle de propiedades con ISR)
- Páginas estáticas (sitemap, robots, legales)
- Edge functions no requeridas
