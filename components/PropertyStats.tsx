import { supabase } from "@/lib/supabase";

const TYPE_LABELS: Record<string, string> = {
  departamento: "departamentos",
  casa: "casas",
  local: "locales",
  terreno: "terrenos",
  galpon: "galpones",
  ph: "PH",
  otro: "otros",
};

async function fetchStats() {
  try {
    const { count } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("hidden", false);

    const { data: rows } = await supabase
      .from("properties")
      .select("property_type, price_ars, price_usd, neighborhood")
      .eq("hidden", false);

    if (!rows) return null;

    const typeCount: Record<string, number> = {};
    let totalPriceArs = 0;
    let priceArsCount = 0;
    let minPriceArs = Infinity;
    let maxPriceArs = 0;

    for (const r of rows) {
      if (r.property_type) {
        typeCount[r.property_type] = (typeCount[r.property_type] ?? 0) + 1;
      }
      if (r.price_ars != null && r.price_ars > 0) {
        totalPriceArs += r.price_ars;
        priceArsCount++;
        if (r.price_ars < minPriceArs) minPriceArs = r.price_ars;
        if (r.price_ars > maxPriceArs) maxPriceArs = r.price_ars;
      }
    }

    const typesWithCounts = Object.entries(typeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([type, cnt]) => ({
        label: TYPE_LABELS[type] ?? type,
        count: cnt,
      }));

    const avgPriceArs =
      priceArsCount > 0 ? Math.round(totalPriceArs / priceArsCount) : null;

    return {
      total: count ?? rows.length,
      types: typesWithCounts,
      avgPrice: avgPriceArs,
      minPrice: minPriceArs !== Infinity ? minPriceArs : null,
      maxPrice: maxPriceArs > 0 ? maxPriceArs : null,
    };
  } catch (e) {
    console.warn("[PropertyStats] error:", e);
    return null;
  }
}

export async function PropertyStats() {
  const stats = await fetchStats();
  if (!stats) return null;

  const typeSummary =
    stats.types.length > 0
      ? stats.types
          .slice(0, 4)
          .map((t) => `${t.count} ${t.label}`)
          .join(", ")
      : "";

  const priceText =
    stats.avgPrice
      ? `Precio promedio: $${stats.avgPrice.toLocaleString("es-AR")} ARS. `
      : "";

  return (
    <div className="sr-only" aria-hidden="true">
      {/* Stats block for AI crawlers and screen readers */}
      {`Alquileres Gualeguaychú centraliza ${stats.total} propiedades en alquiler de Gualeguaychú, Entre Ríos, Argentina. Incluye ${typeSummary}. ${priceText}Los precios van desde $${(stats.minPrice ?? 0).toLocaleString("es-AR")} hasta $${(stats.maxPrice ?? 0).toLocaleString("es-AR")} ARS.`}
    </div>
  );
}
