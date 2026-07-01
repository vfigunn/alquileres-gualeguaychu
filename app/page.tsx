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
      <Suspense fallback={<SearchPageFallback />}>
        <SearchPage />
      </Suspense>

      {/* FAQ Section — SSR, visible a usuarios y crawlers */}
      <section className="w-full max-w-container-max mx-auto px-gutter mt-16 mb-16">
        {/* JSON-LD FAQPage schema */}
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

        <h2 className="font-ebGaramond text-display-md text-primary mb-8 text-center">
          Preguntas frecuentes
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30">
            <h3 className="font-manrope text-label-lg text-primary font-semibold mb-2">
              ¿Cómo encuentro propiedades en alquiler en Gualeguaychú?
            </h3>
            <p className="font-manrope text-body-md text-on-surface-variant">
              Usá nuestro buscador centralizado que reúne todas las propiedades en alquiler de las inmobiliarias de Gualeguaychú en un solo lugar. Podés filtrar por tipo (departamentos, casas, locales), barrio, rango de precio, cantidad de dormitorios y más. Cada publicación te lleva al anuncio original en la inmobiliaria publicante.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30">
            <h3 className="font-manrope text-label-lg text-primary font-semibold mb-2">
              ¿Cada cuánto se actualizan las propiedades?
            </h3>
            <p className="font-manrope text-body-md text-on-surface-variant">
              Nuestro sistema actualiza las propiedades automáticamente desde los sistemas de las inmobiliarias cada pocas horas. Las propiedades que ya no están disponibles se marcan como no vigentes para que siempre veas opciones reales y actualizadas.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30">
            <h3 className="font-manrope text-label-lg text-primary font-semibold mb-2">
              ¿El uso del portal tiene algún costo?
            </h3>
            <p className="font-manrope text-body-md text-on-surface-variant">
              No, el portal es completamente gratuito para quienes buscan alquilar. Centralizamos y estandarizamos las publicaciones de las inmobiliarias para facilitar tu búsqueda, sin cobrar comisiones a inquilinos.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30">
            <h3 className="font-manrope text-label-lg text-primary font-semibold mb-2">
              ¿Qué tipos de propiedades en alquiler puedo encontrar?
            </h3>
            <p className="font-manrope text-body-md text-on-surface-variant">
              Ofrecemos departamentos, casas, locales comerciales, terrenos, PH, galpones y otras propiedades en alquiler en Gualeguaychú, Entre Ríos. Actualmente contamos con más de 90 propiedades publicadas por todas las inmobiliarias de la ciudad.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
