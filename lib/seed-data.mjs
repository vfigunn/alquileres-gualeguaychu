// Datos de ejemplo para que el sitio se vea poblado antes de que
// haya scrapers reales conectados. Cada propiedad usa source_id
// sintético con prefijo "demo-" para que no choquen con IDs reales.

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, "..", "data");

export function seedDatabase(db) {
  const now = new Date().toISOString();

  const sources = [
    {
      slug: "demo-inmobiliaria-centro",
      name: "Inmobiliaria Centro (demo)",
      url: "https://example.com/inmobiliaria-centro",
    },
    {
      slug: "demo-vecinoprop",
      name: "VecinoProp (demo)",
      url: "https://example.com/vecinoprop",
    },
  ];

  const insertSource = db.prepare(
    `INSERT OR IGNORE INTO sources (slug, name, url) VALUES (@slug, @name, @url)`
  );
  for (const s of sources) insertSource.run(s);

  // source_id empieza con "demo-" -> los scrapers reales nunca colisionan.
  const props = [
    {
      source: "demo-inmobiliaria-centro",
      source_id: "demo-1001",
      url: "https://example.com/inmobiliaria-centro/p/1001",
      title: "Departamento 2 ambientes céntrico",
      description:
        "Departamento luminoso a metros de la plaza principal. Excelente estado, listo para mudarse.",
      price_ars: 350000,
      price_usd: null,
      currency: "ARS",
      expenses_ars: 45000,
      property_type: "departamento",
      bedrooms: 1,
      bathrooms: 1,
      area_total: 48,
      area_covered: 48,
      garage: 0,
      rooms: 2,
      address: "San Martín 850",
      neighborhood: "Centro",
      lat: -33.141,
      lng: -58.511,
      images_json: JSON.stringify([
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
      ]),
      features_json: JSON.stringify(["Aire acondicionado", "Balcón", "Sin amueblar"]),
      featured: 1,
      published_at: "2026-06-20T10:00:00Z",
    },
    {
      source: "demo-inmobiliaria-centro",
      source_id: "demo-1002",
      url: "https://example.com/inmobiliaria-centro/p/1002",
      title: "Casa 3 dormitorios con patio",
      description:
        "Casa amplia sobre lote propio. Living-comedor, cocina, 3 dormitorios, 2 baños y fondo libre.",
      price_ars: 520000,
      price_usd: null,
      currency: "ARS",
      expenses_ars: null,
      property_type: "casa",
      bedrooms: 3,
      bathrooms: 2,
      area_total: 180,
      area_covered: 110,
      garage: 1,
      rooms: 4,
      address: "Misiones 1234",
      neighborhood: "Centro",
      lat: -33.144,
      lng: -58.514,
      images_json: JSON.stringify([
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
      ]),
      features_json: JSON.stringify(["Patio", "Garage", "Parrilla"]),
      featured: 1,
      published_at: "2026-06-18T10:00:00Z",
    },
    {
      source: "demo-vecinoprop",
      source_id: "demo-2001",
      url: "https://example.com/vecinoprop/p/2001",
      title: "Monoambiente moderno cerca del río",
      description:
        "Monoambiente remodelado, totalmente amueblado, a 3 cuadras del costanera.",
      price_usd: 320,
      price_ars: null,
      currency: "USD",
      expenses_ars: 38000,
      property_type: "departamento",
      bedrooms: 0,
      bathrooms: 1,
      area_total: 32,
      area_covered: 32,
      garage: 0,
      rooms: 1,
      address: "Alvear 410",
      neighborhood: "Costanera",
      lat: -33.151,
      lng: -58.517,
      images_json: JSON.stringify([
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      ]),
      features_json: JSON.stringify(["Amoblado", "Aire acondicionado", "Calefacción"]),
      featured: 0,
      published_at: "2026-06-15T10:00:00Z",
    },
    {
      source: "demo-vecinoprop",
      source_id: "demo-2002",
      url: "https://example.com/vecinoprop/p/2002",
      title: "Casa en barrio residencial",
      description:
        "Casa en planta alta sobre lote propio, cochera descubierta, jardín delantero.",
      price_ars: 480000,
      price_usd: null,
      currency: "ARS",
      expenses_ars: null,
      property_type: "casa",
      bedrooms: 3,
      bathrooms: 1,
      area_total: 200,
      area_covered: 95,
      garage: 1,
      rooms: 4,
      address: "Las Heras 2200",
      neighborhood: "Barrio Sur",
      lat: -33.16,
      lng: -58.51,
      images_json: JSON.stringify([
        "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200",
      ]),
      features_json: JSON.stringify(["Jardín", "Garage"]),
      featured: 0,
      published_at: "2026-06-10T10:00:00Z",
    },
  ];

  const insertProp = db.prepare(`
    INSERT OR IGNORE INTO properties (
      source, source_id, url, title, description,
      price_ars, price_usd, currency, expenses_ars,
      property_type, bedrooms, bathrooms, area_total, area_covered, garage, rooms,
      address, neighborhood, lat, lng, images_json, features_json,
      featured, published_at
    ) VALUES (
      @source, @source_id, @url, @title, @description,
      @price_ars, @price_usd, @currency, @expenses_ars,
      @property_type, @bedrooms, @bathrooms, @area_total, @area_covered, @garage, @rooms,
      @address, @neighborhood, @lat, @lng, @images_json, @features_json,
      @featured, @published_at
    )
  `);

  let inserted = 0;
  for (const p of props) {
    const r = insertProp.run(p);
    if (r.changes > 0) inserted++;
  }

  // Marca para no resembrar.
  writeFileSync(resolve(DATA_DIR, ".seeded"), now);

  return { sources: sources.length, properties: inserted };
}
