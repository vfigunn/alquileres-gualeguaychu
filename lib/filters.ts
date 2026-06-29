import type { Property, PropertyType } from "./types";
import { priceInARS } from "./format";

export interface Filters {
  q: string;
  types: PropertyType[];
  neighborhoods: string[];
  bedroomsMin: number | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: "ARS" | "USD" | "any";
  garageOnly: boolean;
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  types: [],
  neighborhoods: [],
  bedroomsMin: null,
  priceMin: null,
  priceMax: null,
  currency: "any",
  garageOnly: false,
};

function textMatch(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export function applyFilters(props: Property[], f: Filters): Property[] {
  let out = props;

  if (f.q.trim()) {
    const q = f.q.trim();
    out = out.filter((p) =>
      [p.title, p.description, p.address, p.neighborhood]
        .filter(Boolean)
        .some((s) => textMatch(String(s), q))
    );
  }

  if (f.types.length) {
    const set = new Set(f.types);
    out = out.filter((p) => p.property_type && set.has(p.property_type));
  }

  if (f.neighborhoods.length) {
    const set = new Set(f.neighborhoods);
    out = out.filter((p) => p.neighborhood && set.has(p.neighborhood));
  }

  if (f.bedroomsMin != null) {
    out = out.filter((p) => (p.bedrooms ?? 0) >= f.bedroomsMin!);
  }

  if (f.currency !== "any") {
    out = out.filter((p) => p.currency === f.currency);
  }

  if (f.priceMin != null || f.priceMax != null) {
    out = out.filter((p) => {
      const v = priceInARS(p);
      if (f.priceMin != null && v < f.priceMin) return false;
      if (f.priceMax != null && v > f.priceMax) return false;
      return true;
    });
  }

  if (f.garageOnly) {
    out = out.filter((p) => (p.garage ?? 0) > 0);
  }

  return out;
}

/** Cuenta propiedades por cada valor posible, para mostrar junto a cada
 *  checkbox/badge en el panel de filtros. */
export function facetCounts(
  props: Property[]
): { types: Record<string, number>; neighborhoods: Record<string, number> } {
  const types: Record<string, number> = {};
  const neighborhoods: Record<string, number> = {};
  for (const p of props) {
    if (p.property_type) types[p.property_type] = (types[p.property_type] ?? 0) + 1;
    if (p.neighborhood)
      neighborhoods[p.neighborhood] = (neighborhoods[p.neighborhood] ?? 0) + 1;
  }
  return { types, neighborhoods };
}
