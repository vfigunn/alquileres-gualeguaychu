import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getLocalFacets } from "@/lib/fallback-data";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("properties")
      .select("property_type, neighborhood")
      .eq("hidden", false);

    if (error) {
      console.warn("[api/facets] Supabase error, using fallback:", error.message);
      return NextResponse.json(getLocalFacets());
    }

    const types: Record<string, number> = {};
    const neighborhoods: Record<string, number> = {};

    for (const row of data ?? []) {
      if (row.property_type) {
        types[row.property_type] = (types[row.property_type] ?? 0) + 1;
      }
      if (row.neighborhood) {
        neighborhoods[row.neighborhood] = (neighborhoods[row.neighborhood] ?? 0) + 1;
      }
    }

    return NextResponse.json({ types, neighborhoods });
  } catch (e) {
    console.warn("[api/facets] Supabase exception, using fallback:", e);
    return NextResponse.json(getLocalFacets());
  }
}
