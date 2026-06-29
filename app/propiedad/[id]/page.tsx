import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import type { Property, Source } from "@/lib/types";
import { formatPrice, specsLine, timeAgo, typeLabel, categorizeFeatures, formatDescription } from "@/lib/format";
import { PropertyGallery } from "@/components/PropertyGallery";

// Static export: pre-renderiza una página por cada propiedad conocida.
export const dynamicParams = false;

function dataDir() {
  return path.join(process.cwd(), "public", "data");
}

export async function generateStaticParams() {
  const file = path.join(dataDir(), "properties.json");
  if (!fs.existsSync(file)) return [];
  const dataset = JSON.parse(fs.readFileSync(file, "utf-8")) as {
    properties: { id: number }[];
  };
  return dataset.properties.map((p) => ({ id: String(p.id) }));
}

function loadProperty(id: string): Property | null {
  const file = path.join(dataDir(), `property-${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as Property;
}

function loadSources(): Source[] {
  const file = path.join(dataDir(), "properties.json");
  if (!fs.existsSync(file)) return [];
  const dataset = JSON.parse(fs.readFileSync(file, "utf-8")) as {
    sources: Source[];
  };
  return dataset.sources;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const p = loadProperty(params.id);
  if (!p) return { title: "Propiedad no encontrada" };
  return {
    title: p.title ?? "Propiedad en alquiler",
    description: p.description ?? undefined,
  };
}

export default function PropiedadPage({
  params,
}: {
  params: { id: string };
}) {
  const p = loadProperty(params.id);
  if (!p) {
    return (
      <div className="py-16 text-center w-full">
        <h1 className="font-ebGaramond text-headline-lg text-primary">Propiedad no encontrada</h1>
        <Link
          href="/"
          className="mt-4 inline-block font-manrope text-label-md text-secondary hover:underline"
        >
          ← Volver al buscador
        </Link>
      </div>
    );
  }

  const sources = loadSources();
  const source = sources.find((s) => s.slug === p.source);

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
            <h1 className="font-ebGaramond text-display-lg text-primary mb-2 leading-tight">
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
