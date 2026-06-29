import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getLocalDataset } from "@/lib/fallback-data";
import type { Source } from "@/lib/types";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("sources")
      .select("slug, name, url, enabled")
      .eq("enabled", true)
      .order("name");

    if (error) {
      console.warn("[api/sources] Supabase error, using fallback:", error.message);
      return NextResponse.json(getLocalDataset()?.sources ?? []);
    }

    return NextResponse.json((data ?? []) as Source[]);
  } catch (e) {
    console.warn("[api/sources] Supabase exception, using fallback:", e);
    return NextResponse.json(getLocalDataset()?.sources ?? []);
  }
}
