import type { Property } from "./types";

/** Formatea un número en formato argentino (1.234.567). */
export function formatNumber(n: number | null | undefined): string | null {
  if (n == null) return null;
  return n.toLocaleString("es-AR");
}

/** Texto legible del precio principal de una propiedad. */
export function formatPrice(p: Pick<Property, "currency" | "price_ars" | "price_usd">): string {
  if (p.currency === "USD" && p.price_usd != null) {
    return `U$S ${formatNumber(p.price_usd)}`;
  }
  if (p.currency === "ARS" && p.price_ars != null) {
    return `$ ${formatNumber(p.price_ars)}`;
  }
  // Si solo hay uno de los dos, lo mostramos igual.
  if (p.price_usd != null) return `U$S ${formatNumber(p.price_usd)}`;
  if (p.price_ars != null) return `$ ${formatNumber(p.price_ars)}`;
  return "Consultar";
}

/** Precio normalizado a ARS para comparar/ordenar. Usa el otro campo si falta. */
export function priceInARS(p: Pick<Property, "price_ars" | "price_usd">): number {
  // Siempre que haya ARS lo usamos; si solo hay USD, lo pasamos a un
  // número comparable (aproximado, sin tipo de cambio real) multiplicando.
  // Esto es SOLO para ordenar/filtrar; el precio mostrado es el original.
  if (p.price_ars != null) return p.price_ars;
  if (p.price_usd != null) return p.price_usd * 1500; // estimación conservadora
  return 0;
}

/** Resumen compacto de specs: "2 amb · 1 dorm · 48 m²". */
export function specsLine(p: Pick<
  Property,
  "rooms" | "bedrooms" | "bathrooms" | "area_total"
>): string {
  const parts: string[] = [];
  if (p.rooms != null) parts.push(`${p.rooms} amb`);
  if (p.bedrooms != null && p.bedrooms > 0) parts.push(`${p.bedrooms} dorm`);
  if (p.bathrooms != null && p.bathrooms > 0) parts.push(`${p.bathrooms} bañ`);
  if (p.area_total != null) parts.push(`${p.area_total} m²`);
  return parts.join(" · ");
}

/** Etiqueta legible del tipo de propiedad. */
export function typeLabel(t: string | null): string {
  if (!t) return "Propiedad";
  const map: Record<string, string> = {
    casa: "Casa",
    departamento: "Departamento",
    ph: "PH",
    terreno: "Terreno",
    local: "Local",
    galpon: "Galpón",
    otro: "Otro",
  };
  return map[t] ?? t.charAt(0).toUpperCase() + t.slice(1);
}

/** Cuánto hace que se publicó, en español. */
export function timeAgo(iso: string | null): string | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
  const years = Math.floor(months / 12);
  return `hace ${years} ${years === 1 ? "año" : "años"}`;
}

/**
 * Convierte un texto plano en una lista de párrafos.
 * Si el texto no tiene saltos de línea y es muy largo, lo divide inteligentemente por oraciones.
 */
export function formatDescription(desc: string | null): string[] {
  if (!desc) return [];
  const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
  
  if (lines.length === 1 && lines[0].length > 300) {
    const sentences = lines[0].split(/\.\s+/);
    const paragraphs: string[] = [];
    let currentParagraph = "";

    for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i].trim();
      if (!sentence) continue;
      
      if (i < sentences.length - 1 && !sentence.endsWith('.')) {
        sentence += '.';
      }

      if (currentParagraph.length + sentence.length > 350 && currentParagraph.length > 0) {
        paragraphs.push(currentParagraph);
        currentParagraph = sentence;
      } else {
        currentParagraph += (currentParagraph ? " " : "") + sentence;
      }
    }
    if (currentParagraph) {
      paragraphs.push(currentParagraph);
    }
    return paragraphs;
  }
  return lines;
}

export type FeatureCategory = "Servicios" | "Ambientes" | "Adicionales" | "Superficies y medidas" | "Información básica";

export function categorizeFeatures(features: string[]): Record<FeatureCategory, string[]> {
  const categories: Record<FeatureCategory, string[]> = {
    "Servicios": [],
    "Ambientes": [],
    "Adicionales": [],
    "Superficies y medidas": [],
    "Información básica": [],
  };

  const services = ["agua", "luz", "gas", "internet", "teléfono", "cable", "desagüe", "pavimento", "cloaca", "wifi"];
  const rooms = ["cocina", "comedor", "dormitorio", "baño", "toilette", "lavadero", "patio", "balcón", "living", "hall", "sótano", "jardín", "terraza", "altillo", "baulera", "cochera", "escritorio", "vestidor"];
  const additions = ["aire", "alarma", "amoblado", "calefacción", "piscina", "gimnasio", "solarium", "sum", "vigilancia", "parrilla", "quincho", "pileta", "ascensor", "hidromasaje", "sauna", "seguridad"];
  const info = ["antigüedad", "condición", "situación", "orientación", "disposición", "crédito", "expensas", "estado"];

  features.forEach(f => {
    const fl = f.toLowerCase();
    if (fl.includes("superficie") || fl.includes("m²") || fl.includes("m2") || fl.includes("metros") || fl.includes("medida")) {
      categories["Superficies y medidas"].push(f);
    } else if (info.some(i => fl.includes(i))) {
      categories["Información básica"].push(f);
    } else if (services.some(s => fl.includes(s))) {
      categories.Servicios.push(f);
    } else if (rooms.some(r => fl.includes(r))) {
      categories.Ambientes.push(f);
    } else if (additions.some(a => fl.includes(a))) {
      categories.Adicionales.push(f);
    } else {
      categories["Información básica"].push(f);
    }
  });

  return categories;
}
