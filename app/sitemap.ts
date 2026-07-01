import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://alquileresgualeguaychu.com.ar";

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/como-funciona`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Páginas de categoría
    {
      url: `${baseUrl}/departamentos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/casas`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/locales`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terrenos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Propiedades activas desde Supabase
  try {
    const { data } = await supabase
      .from("properties")
      .select("slug, last_seen_at")
      .eq("hidden", false)
      .order("last_seen_at", { ascending: false });

    if (data) {
      for (const prop of data) {
        if (prop.slug) {
          staticPages.push({
            url: `${baseUrl}/propiedad/${prop.slug}`,
            lastModified: prop.last_seen_at
              ? new Date(prop.last_seen_at)
              : new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
          });
        }
      }
    }
  } catch {
    console.warn("[sitemap] No se pudieron obtener propiedades de Supabase");
  }

  return staticPages;
}
