import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import type { Property, Source } from "@/lib/types";
import { formatPrice, specsLine, typeLabel, categorizeFeatures, formatDescription } from "@/lib/format";
import { PropertyGallery } from "@/components/PropertyGallery";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════════════
   Página de detalle de propiedad — SEO-friendly con slug
   /propiedad/<slug>
   ═══════════════════════════════════════════════════════════ */

// Revalidar cada 6 horas (ISR). Las props nuevas llegan con el
// próximo build o cuando el scraper actualice Supabase.
export const revalidate = 21600; // 6h en segundos

async function getProperty(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .eq("hidden", false)
    .single();

  if (error || !data) return null;

  // Normalizar campos JSONB
  const images = Array.isArray(data.images_json) ? data.images_json as string[] : [];
  const features = Array.isArray(data.features_json) ? data.features_json as string[] : [];

  return {
    id: data.id,
    slug: data.slug ?? null,
    source: data.source,
    source_id: data.source_id,
    url: data.url,
    title: data.title ?? null,
    description: data.description ?? null,
    price_ars: data.price_ars ?? null,
    price_usd: data.price_usd ?? null,
    currency: data.currency ?? null,
    expenses_ars: data.expenses_ars ?? null,
    property_type: data.property_type ?? null,
    operation: data.operation ?? "alquiler",
    bedrooms: data.bedrooms ?? null,
    bathrooms: data.bathrooms ?? null,
    area_total: data.area_total ?? null,
    area_covered: data.area_covered ?? null,
    garage: data.garage ?? 0,
    rooms: data.rooms ?? null,
    address: data.address ?? null,
    neighborhood: data.neighborhood ?? null,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    images,
    features,
    featured: Boolean(data.featured),
    hidden: Boolean(data.hidden),
    first_seen_at: data.first_seen_at ?? new Date().toISOString(),
    last_seen_at: data.last_seen_at ?? new Date().toISOString(),
    published_at: data.published_at ?? null,
  };
}

async function getSource(slug: string): Promise<Source | null> {
  const { data, error } = await supabase
    .from("sources")
    .select("slug, name, url, enabled")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as Source;
}

/* ── Metadata dinámica para SEO ── */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const p = await getProperty(params.slug);
  if (!p) return { title: "Propiedad no encontrada" };

  const title = p.title ?? "Propiedad en alquiler";
  const description = p.description?.slice(0, 160) ?? `Alquiler en ${p.neighborhood ?? p.address ?? "Gualeguaychú"}`;
  const price = p.price_ars ? `$ ${p.price_ars.toLocaleString("es-AR")}/mes` : "Consultar precio";

  return {
    title: `${title} — ${price}`,
    description,
    alternates: {
      canonical: `https://www.alquileresgualeguaychu.com.ar/propiedad/${p.slug}`,
    },
    openGraph: {
      title: `${title} — ${price}`,
      description,
      images: p.images.length > 0 ? [p.images[0]] : ["/og-image.jpg"],
      url: `https://www.alquileresgualeguaychu.com.ar/propiedad/${p.slug}`,
      type: "website",
    },
  };
}

/* ── Página ── */

export default async function PropiedadPage({
  params,
}: {
  params: { slug: string };
}) {
  const p = await getProperty(params.slug);
  if (!p) notFound();

  const source = await getSource(p.source);

  return (
    <div className="w-full flex flex-col gap-lg min-w-0">
      <div className="mb-4">
        <Link
          href="/"
          className="font-manrope text-label-md text-secondary hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Volver al buscador
        </Link>
      </div>

      {/* Hero Gallery */}
      <PropertyGallery p={p} />

      {/* Main Content & Sidebar */}
      <div className="flex flex-col lg:flex-row gap-lg">
        {/* Left Column (Details) */}
        <section className="flex-1 flex flex-col gap-md">
          {/* Header Info */}
          <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30 shadow-sm">
            <h1 className="font-ebGaramond text-headline-lg-mobile md:text-display-lg text-primary mb-2 leading-tight">
              {p.title ?? "Propiedad en alquiler"}
            </h1>
            <p className="font-manrope text-body-lg text-on-surface-variant flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[20px]">location_on</span>
              {p.address ?? p.neighborhood ?? "Gualeguaychú"}
            </p>
            <div className="flex flex-wrap gap-4 items-end border-t border-outline-variant/30 pt-6">
              {p.price_ars != null && (
                <div className="flex flex-col">
                  <span className="font-manrope text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Precio Alquiler</span>
                  <span className="font-ebGaramond text-headline-lg text-primary">
                    $ {p.price_ars.toLocaleString("es-AR")} / mes
                  </span>
                </div>
              )}
              {p.price_usd != null && (
                <div className="flex flex-col">
                  <span className="font-manrope text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Precio Venta</span>
                  <span className="font-ebGaramond text-headline-lg text-primary">
                    U$S {p.price_usd.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
              {p.price_ars == null && p.price_usd == null && (
                <div className="flex flex-col">
                  <span className="font-manrope text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Precio</span>
                  <span className="font-ebGaramond text-headline-lg text-primary">Consultar</span>
                </div>
              )}
              {p.expenses_ars != null && (
                <div className="flex flex-col mb-1.5">
                  <span className="font-manrope text-label-md text-on-surface-variant">+ ${p.expenses_ars.toLocaleString("es-AR")} expensas</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Specs */}
          {(specsLine(p) || p.garage) && (
            <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30 shadow-sm">
              <h2 className="font-ebGaramond text-headline-md text-primary mb-4">Características principales</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Spec icon="meeting_room" label="Ambientes" value={p.rooms} />
                <Spec icon="bed" label="Dormitorios" value={p.bedrooms} />
                <Spec icon="shower" label="Baños" value={p.bathrooms} />
                <Spec icon="aspect_ratio" label="Superficie" value={p.area_total ? `${p.area_total} m²` : null} />
                <Spec icon="garage" label="Cocheras" value={p.garage || null} />
                <Spec icon="square_foot" label="Cubierta" value={p.area_covered ? `${p.area_covered} m²` : null} />
              </div>
            </div>
          )}

          {/* Description */}
          {p.description && (
            <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30 shadow-sm">
              <h2 className="font-ebGaramond text-headline-md text-primary mb-4">Descripción</h2>
              <div className="font-manrope text-body-md text-on-surface-variant leading-relaxed">
                {formatDescription(p.description).map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {p.features.length > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30 shadow-sm">
              <h2 className="font-ebGaramond text-headline-md text-primary mb-6">Características</h2>
              <div className="flex flex-col gap-6">
                {Object.entries(categorizeFeatures(p.features)).map(([category, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <div key={category}>
                      <h3 className="font-manrope text-label-md text-on-surface-variant uppercase tracking-wider mb-3">
                        {category}
                      </h3>
                      <ul className="flex flex-wrap gap-3">
                        {items.map((f, i) => (
                          <li
                            key={i}
                            className="rounded-full border border-outline-variant/50 bg-surface px-4 py-2 font-manrope text-label-md text-on-surface-variant flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Right Column (Sticky Sidebar) */}
        <aside className="w-full lg:w-[350px] shrink-0">
          <div className="sticky top-[120px] bg-surface-container-low rounded-2xl p-lg border border-outline-variant/30 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="font-manrope text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
                Publicado por
              </h3>
              <p className="font-ebGaramond text-headline-md text-primary">
                {source?.name ?? "Fuente externa"}
              </p>
              <p className="font-manrope text-body-md text-on-surface-variant mt-2">
                Profesionales en el mercado inmobiliario de Gualeguaychú.
              </p>
            </div>

            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer noindex"
              className="w-full bg-secondary-container text-on-secondary-container font-manrope text-label-md py-4 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-sm"
            >
              <span>Contactar Inmobiliaria</span>
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>

            <div className="pt-4 border-t border-outline-variant/20 font-manrope text-label-sm text-on-surface-variant/70 text-center">
              Para contactar o agendar una visita, dirígete al sitio web original. No gestionamos contactos ni cobros.
            </div>
          </div>
        </aside>
      </div>

      {/* Structured Data (JSON-LD) para Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: p.title ?? "Propiedad en alquiler",
            description: p.description?.slice(0, 300) ?? "",
            url: `https://www.alquileresgualeguaychu.com.ar/propiedad/${p.slug}`,
            image: p.images.length > 0 ? p.images[0] : undefined,
            datePosted: p.published_at ?? p.first_seen_at,
            offers: {
              "@type": "Offer",
              price: p.price_ars ?? p.price_usd ?? 0,
              priceCurrency: p.currency ?? "ARS",
              availability: "https://schema.org/InStock",
            },
            address: p.address
              ? {
                  "@type": "PostalAddress",
                  streetAddress: p.address,
                  addressLocality: "Gualeguaychú",
                  addressRegion: "Entre Ríos",
                  addressCountry: "AR",
                }
              : undefined,
            numberOfRooms: p.rooms ?? undefined,
            floorSize: p.area_total
              ? {
                  "@type": "QuantitativeValue",
                  value: p.area_total,
                  unitCode: "MTK",
                }
              : undefined,
          }),
        }}
      />
    </div>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number | string | null;
}) {
  if (value == null) return null;
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface-container-low">
      <div className="flex items-center gap-2 font-manrope text-label-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
        {label}
      </div>
      <div className="font-ebGaramond text-headline-sm font-semibold text-primary">
        {value}
      </div>
    </div>
  );
}
