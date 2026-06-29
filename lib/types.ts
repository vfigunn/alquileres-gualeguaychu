// Tipos compartidos entre el backend (lectura DB) y el frontend.
// Estos son los únicos tipos que el frontend "conoce".

export type PropertyType =
  | "casa"
  | "departamento"
  | "ph"
  | "terreno"
  | "local"
  | "galpon"
  | "otro";

export type Currency = "ARS" | "USD";

/** Entidad tal como vive en la DB y en el JSON estático que sirve el sitio. */
export interface Property {
  id: number;
  source: string;
  source_id: string;
  url: string;

  title: string | null;
  description: string | null;

  price_ars: number | null;
  price_usd: number | null;
  currency: Currency | null;
  expenses_ars: number | null;

  property_type: PropertyType | null;
  operation: string;

  bedrooms: number | null;
  bathrooms: number | null;
  area_total: number | null;
  area_covered: number | null;
  garage: number;
  rooms: number | null;

  address: string | null;
  neighborhood: string | null;
  lat: number | null;
  lng: number | null;

  images: string[];
  features: string[];

  featured: boolean;
  hidden: boolean;

  first_seen_at: string;
  last_seen_at: string;
  published_at: string | null;
}

/** Fuente (inmobiliaria) para mostrar badges/agrupar. */
export interface Source {
  slug: string;
  name: string;
  url: string;
  enabled: boolean;
}

/** Todo lo que el frontend recibe en /data/properties.json. */
export interface Dataset {
  generated_at: string;
  sources: Source[];
  properties: Property[];
}
