import { Suspense } from "react";
import { SearchPage } from "@/components/SearchPage";
import { PropertyStats } from "@/components/PropertyStats";

function SearchPageFallback() {
  return (
    <div className="w-full min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="font-manrope text-body-md text-on-surface-variant">Cargando...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* SSR stats block — visible to AI crawlers without JS */}
      <Suspense fallback={null}>
        <PropertyStats />
      </Suspense>

      {/* SearchPage needs flex to lay out sidebar + grid side by side on desktop */}
      <div className="flex gap-lg w-full">
        <Suspense fallback={<SearchPageFallback />}>
          <SearchPage />
        </Suspense>
      </div>

      {/* FAQ Section — SSR accordion style (matches /como-funciona/) */}
      <section className="py-xl w-full max-w-container-max mx-auto px-gutter">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "¿Cómo encuentro propiedades en alquiler en Gualeguaychú?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Usá nuestro buscador centralizado que reúne todas las propiedades en alquiler de las inmobiliarias de Gualeguaychú en un solo lugar. Podés filtrar por tipo (departamentos, casas, locales), barrio, rango de precio, cantidad de dormitorios y más. Cada publicación te lleva al anuncio original en la inmobiliaria publicante.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Cada cuánto se actualizan las propiedades?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Nuestro sistema actualiza las propiedades automáticamente desde los sistemas de las inmobiliarias cada pocas horas. Las propiedades que ya no están disponibles se marcan como no vigentes para que siempre veas opciones reales y actualizadas.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿El uso del portal tiene algún costo?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No, el portal es completamente gratuito para quienes buscan alquilar. Centralizamos y estandarizamos las publicaciones de las inmobiliarias para facilitar tu búsqueda, sin cobrar comisiones a inquilinos.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Qué tipos de propiedades en alquiler puedo encontrar?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Ofrecemos departamentos, casas, locales comerciales, terrenos, PH, galpones y otras propiedades en alquiler en Gualeguaychú, Entre Ríos. Actualmente contamos con más de 90 propiedades publicadas por todas las inmobiliarias de la ciudad.",
                  },
                },
              ],
            }),
          }}
        />
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-headline-lg text-headline-lg text-primary">
              Preguntas Frecuentes
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-4">
              Respuestas claras a tus dudas más comunes.
            </p>
          </div>
          <div className="space-y-4">
            <details className="border border-outline-variant/30 rounded-lg bg-surface group">
              <summary className="font-headline-md text-headline-md text-primary text-lg p-6 cursor-pointer list-none flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                <span>¿Cómo encuentro propiedades en alquiler en Gualeguaychú?</span>
                <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="p-6 pt-0 border-t border-outline-variant/10 font-body-md text-body-md text-on-surface-variant">
                Usá nuestro buscador centralizado que reúne todas las propiedades en alquiler de las inmobiliarias de Gualeguaychú en un solo lugar. Podés filtrar por tipo (departamentos, casas, locales), barrio, rango de precio, cantidad de dormitorios y más. Cada publicación te lleva al anuncio original en la inmobiliaria publicante.
              </div>
            </details>

            <details className="border border-outline-variant/30 rounded-lg bg-surface group">
              <summary className="font-headline-md text-headline-md text-primary text-lg p-6 cursor-pointer list-none flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                <span>¿Cada cuánto se actualizan las propiedades?</span>
                <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="p-6 pt-0 border-t border-outline-variant/10 font-body-md text-body-md text-on-surface-variant">
                Nuestro sistema actualiza las propiedades automáticamente desde los sistemas de las inmobiliarias cada pocas horas. Las propiedades que ya no están disponibles se marcan como no vigentes para que siempre veas opciones reales y actualizadas.
              </div>
            </details>

            <details className="border border-outline-variant/30 rounded-lg bg-surface group">
              <summary className="font-headline-md text-headline-md text-primary text-lg p-6 cursor-pointer list-none flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                <span>¿El uso del portal tiene algún costo?</span>
                <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="p-6 pt-0 border-t border-outline-variant/10 font-body-md text-body-md text-on-surface-variant">
                No, el portal es completamente gratuito para quienes buscan alquilar. Centralizamos y estandarizamos las publicaciones de las inmobiliarias para facilitar tu búsqueda, sin cobrar comisiones a inquilinos.
              </div>
            </details>

            <details className="border border-outline-variant/30 rounded-lg bg-surface group">
              <summary className="font-headline-md text-headline-md text-primary text-lg p-6 cursor-pointer list-none flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                <span>¿Qué tipos de propiedades en alquiler puedo encontrar?</span>
                <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="p-6 pt-0 border-t border-outline-variant/10 font-body-md text-body-md text-on-surface-variant">
                Ofrecemos departamentos, casas, locales comerciales, terrenos, PH, galpones y otras propiedades en alquiler en Gualeguaychú, Entre Ríos. Actualmente contamos con más de 90 propiedades publicadas por todas las inmobiliarias de la ciudad.
              </div>
            </details>
          </div>
        </div>
      </section>
    </>
  );
}
