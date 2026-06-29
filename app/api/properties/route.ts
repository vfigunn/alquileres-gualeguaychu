import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getLocalProperties, getLocalDataset } from "@/lib/fallback-data";
import { applyFilters } from "@/lib/filters";
import type { Property, PropertyType } from "@/lib/types";

const PAGE_SIZE = 12;

const VALID_TYPES: PropertyType[] = [
  "casa",
  "departamento",
  "ph",
  "terreno",
  "local",
  "galpon",
  "otro",
];

function normalizeProperty(row: Record<string, unknown>): Property {
  return {
    id: row.id as number,
    source: row.source as string,
    source_id: row.source_id as string,
    url: row.url as string,
    title: (row.title as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    price_ars: (row.price_ars as number | null) ?? null,
    price_usd: (row.price_usd as number | null) ?? null,
    currency: (row.currency as "ARS" | "USD" | null) ?? null,
    expenses_ars: (row.expenses_ars as number | null) ?? null,
    property_type: (row.property_type as PropertyType | null) ?? null,
    operation: (row.operation as string) ?? "alquiler",
    bedrooms: (row.bedrooms as number | null) ?? null,
    bathrooms: (row.bathrooms as number | null) ?? null,
    area_total: (row.area_total as number | null) ?? null,
    area_covered: (row.area_covered as number | null) ?? null,
    garage: (row.garage as number) ?? 0,
    rooms: (row.rooms as number | null) ?? null,
    address: (row.address as string | null) ?? null,
    neighborhood: (row.neighborhood as string | null) ?? null,
    lat: (row.lat as number | null) ?? null,
    lng: (row.lng as number | null) ?? null,
    images: safeJsonArray(row.images_json),
    features: safeJsonArray(row.features_json),
    featured: Boolean(row.featured),
    hidden: Boolean(row.hidden),
    first_seen_at: (row.first_seen_at as string) ?? new Date().toISOString(),
    last_seen_at: (row.last_seen_at as string) ?? new Date().toISOString(),
    published_at: (row.published_at as string | null) ?? null,
  };
}

function safeJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as string[];
  try {
    const parsed = JSON.parse(value as string);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? String(PAGE_SIZE))));
  const sort = searchParams.get("sort") ?? "relevance";

  const filters = {
    q: searchParams.get("q")?.trim().toLowerCase() ?? "",
    types: (searchParams.get("types") ?? "")
      .split(",")
      .filter((t): t is PropertyType => VALID_TYPES.includes(t as PropertyType)),
    neighborhoods: (searchParams.get("neighborhoods") ?? "").split(",").filter(Boolean),
    bedroomsMin: Number(searchParams.get("bedroomsMin") ?? "0") || null,
    priceMin: Number(searchParams.get("priceMin") ?? "0") || null,
    priceMax: Number(searchParams.get("priceMax") ?? "0") || null,
    currency: searchParams.get("currency") ?? "any",
    garageOnly: searchParams.get("garageOnly") === "true",
  };

  // 1. Intentar Supabase
  let useSupabase = true;
  let allRows: Property[] = [];

  try {
    let query = supabase
      .from("properties")
      .select("*", { count: "exact" })
      .eq("hidden", false);

    if (filters.types.length > 0) query = query.in("property_type", filters.types);
    if (filters.neighborhoods.length > 0) query = query.in("neighborhood", filters.neighborhoods);
    if (filters.bedroomsMin != null) query = query.gte("bedrooms", filters.bedroomsMin);
    if (filters.currency === "ARS" || filters.currency === "USD") query = query.eq("currency", filters.currency);
    if (filters.garageOnly) query = query.gt("garage", 0);

    switch (sort) {
      case "price_asc":
        query = query.order("price_ars", { ascending: true, nullsFirst: false });
        break;
      case "price_desc":
        query = query.order("price_ars", { ascending: false, nullsFirst: false });
        break;
      case "newest":
        query = query.order("published_at", { ascending: false, nullsFirst: false });
        break;
      default:
        query = query
          .order("featured", { ascending: false })
          .order("published_at", { ascending: false, nullsFirst: false });
    }

    const { data, error } = await query;

    if (error) {
      console.warn("[api/properties] Supabase error, using fallback:", error.message);
      useSupabase = false;
    } else {
      allRows = (data ?? []).map(normalizeProperty);
    }
  } catch (e) {
    console.warn("[api/properties] Supabase exception, using fallback:", e);
    useSupabase = false;
  }

  // 2. Fallback a JSON local
  if (!useSupabase) {
    const dataset = getLocalDataset();
    if (dataset) {
      const local = applyFilters(dataset.properties, {
        ...filters,
        // adaptar currency al tipo esperado por applyFilters
        currency: (filters.currency === "ARS" || filters.currency === "USD" ? filters.currency : "any") as "ARS" | "USD" | "any",
      });
      allRows = local.sort((a, b) => {
        switch (sort) {
          case "price_asc": return (a.price_ars ?? a.price_usd ?? 0) - (b.price_ars ?? b.price_usd ?? 0);
          case "price_desc": return (b.price_ars ?? b.price_usd ?? 0) - (a.price_ars ?? a.price_usd ?? 0);
          case "newest": return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
          default:
            return Number(b.featured) - Number(a.featured) ||
              new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime() ||
              (a.price_ars ?? a.price_usd ?? 0) - (b.price_ars ?? b.price_usd ?? 0);
        }
      });
    }
  }

  // 3. Filtrado por texto en memoria (Supabase no lo hace robustamente con ILIKE OR)
  let results = allRows;
  if (filters.q) {
    results = results.filter((p) =>
      [p.title, p.description, p.address, p.neighborhood]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(filters.q))
    );
  }

  // 4. Paginación manual (funciona tanto con Supabase como fallback)
  const totalCount = results.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const safePage = Math.min(page, totalPages);
  const from = (safePage - 1) * limit;
  const pageResults = results.slice(from, from + limit);

  return NextResponse.json({
    properties: pageResults,
    pagination: {
      page: safePage,
      limit,
      totalCount,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  });
}
