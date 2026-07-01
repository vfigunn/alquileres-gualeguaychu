import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo Funciona",
  description:
    "Centralizamos la oferta inmobiliaria de Gualeguaychú para que encuentres tu próximo alquiler de forma rápida y sencilla. Buscá departamentos, casas y locales de todas las inmobiliarias en un solo portal.",
  openGraph: {
    title: "Cómo Funciona | Alquileres Gualeguaychú",
    description:
      "Centralizamos la oferta inmobiliaria de Gualeguaychú para que encuentres tu próximo alquiler de forma rápida y sencilla. Buscá departamentos, casas y locales de todas las inmobiliarias en un solo portal.",
  },
};

export default function ComoFuncionaPage() {
  return (
    <div className="w-full flex flex-col min-w-0">
      {/* JSON-LD FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "¿Ustedes son una inmobiliaria?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No, somos un portal agregador. Nuestro objetivo es recopilar y estandarizar las publicaciones de las distintas inmobiliarias de Gualeguaychú en un solo lugar para facilitar la búsqueda. Todas las gestiones de alquiler se realizan directamente con la inmobiliaria responsable de cada propiedad.",
                },
              },
              {
                "@type": "Question",
                name: "¿Tengo que pagar para buscar propiedades?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No, el uso de nuestra plataforma es completamente gratuito para los usuarios que buscan alquileres.",
                },
              },
              {
                "@type": "Question",
                name: "¿Puedo publicar mi propiedad como dueño directo?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Por el momento, solo agregamos propiedades publicadas por inmobiliarias registradas de Gualeguaychú para garantizar la seguridad y profesionalidad de las publicaciones.",
                },
              },
              {
                "@type": "Question",
                name: "Soy Inmobiliaria, ¿cómo agrego mis propiedades?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Para que sus propiedades aparezcan en nuestro portal, comuníquese con nosotros a través de la página de Contacto. Realizaremos una integración automatizada para que su catálogo se actualice diariamente en nuestro sitio sin esfuerzo manual.",
                },
              },
            ],
          }),
        }}
      />
      {/* Hero Section */}
      <section className="py-xl text-center md:text-left md:flex md:items-center md:gap-xl w-full">
        <div className="md:w-1/2">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-display-lg md:text-display-lg text-primary mb-6">
            Todas las propiedades en un solo lugar
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 max-w-2xl mx-auto md:mx-0">
            Centralizamos la oferta inmobiliaria de Gualeguaychú para que encuentres tu próximo alquiler de forma rápida y sencilla. Estandarizamos la información para que puedas comparar y decidir mejor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a
              className="inline-flex justify-center items-center px-8 py-3 bg-secondary text-on-secondary font-label-md text-label-md rounded shadow-sm hover:bg-secondary/90 transition-colors"
              href="#inquilinos"
            >
              Buscar propiedades
            </a>
            <a
              className="inline-flex justify-center items-center px-8 py-3 border border-outline text-primary font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors"
              href="#inmobiliarias"
            >
              Soy Inmobiliaria
            </a>
          </div>
        </div>
        <div className="hidden md:block md:w-1/2">
          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-surface-container-high shadow-lg border border-outline-variant/20">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC2cy2mZFVhK29FswnDoyaYh3xaoOQzjZlW3Tt2-IavXbjGkVmGFC0hdqKA3lKrRQUud3oge3sVeYTQYZ7_AvdjKbR03G_lzKyo5qRK9E_87212H2dlzE3k5OOIGmBHIqGKoVPpEorsg0OYdsYDfwKFBT1MJWpchZj3gXvRBvrRQXvnBiD3iZ6-2veqGTLZll3HXOOxnaTQXtG8lhkVz5b2XCaYTDrvcxNL7qzhjLQabBw6mRTzUaRWii4VSPSJEo1o9Qcb6fVKKzA')",
              }}
            ></div>
          </div>
        </div>
      </section>

      {/* Process for Renters */}
      <section
        className="py-lg border-t border-outline-variant/30 w-full"
        id="inquilinos"
      >
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm rounded-full mb-4">
            Para Inquilinos
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary">
            Encuentre su lugar ideal
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="bg-surface p-8 rounded-xl border border-outline-variant/20 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                search
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">
              Busca tu propiedad
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Explore la mayor oferta de inmuebles utilizando filtros avanzados para encontrar exactamente lo que necesita.
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-surface p-8 rounded-xl border border-outline-variant/20 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                chat
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">
              Contacta a la inmobiliaria
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Encuentre los datos de contacto directo de la inmobiliaria que gestiona la propiedad que le interesa.
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-surface p-8 rounded-xl border border-outline-variant/20 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                calendar_month
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">
              Coordina una visita
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Agende una visita presencial comunicándose con los profesionales a cargo del inmueble.
            </p>
          </div>
          {/* Step 4 */}
          <div className="bg-surface p-8 rounded-xl border border-outline-variant/20 hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-6">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                signature
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md text-primary mb-3">
              Firma el contrato
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Concrete el alquiler directamente con la inmobiliaria, con el respaldo y seguridad que ofrecen los profesionales.
            </p>
          </div>
        </div>
      </section>

      {/* Process for Owners/Inmobiliarias */}
      <section
        className="py-lg mt-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6 md:p-12 w-full"
        id="inmobiliarias"
      >
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm rounded-full mb-4">
            Para Inmobiliarias
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary">
            Sume su catálogo al buscador
          </h2>
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 text-lg">
            Alquileres Gualeguaychú es un portal exclusivo que estandariza y centraliza la oferta de alquileres locales.
            No permitimos publicaciones manuales de dueños directos. Si representa a una inmobiliaria y desea que sus propiedades aparezcan en nuestro buscador, contáctenos para integrar su catálogo de forma automatizada.
          </p>
          <a
            className="inline-flex justify-center items-center px-8 py-3 bg-primary text-on-primary font-label-md text-label-md rounded shadow-sm hover:bg-primary/90 transition-colors"
            href="/contacto"
          >
            Contactar para integración
          </a>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-xl w-full">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-headline-lg text-headline-lg text-primary">
              Preguntas Frecuentes
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-4">
              Respuestas claras a sus dudas más comunes.
            </p>
          </div>
          <div className="space-y-4">
            {/* FAQ Items */}
            <details className="border border-outline-variant/30 rounded-lg bg-surface group">
              <summary className="font-headline-md text-headline-md text-primary text-lg p-6 cursor-pointer list-none flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                <span>¿Ustedes son una inmobiliaria?</span>
                <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="p-6 pt-0 border-t border-outline-variant/10 font-body-md text-body-md text-on-surface-variant">
                No, somos un portal agregador. Nuestro objetivo es recopilar y estandarizar las publicaciones de las distintas inmobiliarias de Gualeguaychú en un solo lugar para facilitar la búsqueda. Todas las gestiones de alquiler se realizan directamente con la inmobiliaria responsable de cada propiedad.
              </div>
            </details>
            
            <details className="border border-outline-variant/30 rounded-lg bg-surface group">
              <summary className="font-headline-md text-headline-md text-primary text-lg p-6 cursor-pointer list-none flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                <span>¿Tengo que pagar para buscar propiedades?</span>
                <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="p-6 pt-0 border-t border-outline-variant/10 font-body-md text-body-md text-on-surface-variant">
                No, el uso de nuestra plataforma es completamente gratuito para los usuarios que buscan alquileres.
              </div>
            </details>
            
            <details className="border border-outline-variant/30 rounded-lg bg-surface group">
              <summary className="font-headline-md text-headline-md text-primary text-lg p-6 cursor-pointer list-none flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                <span>¿Puedo publicar mi propiedad como dueño directo?</span>
                <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="p-6 pt-0 border-t border-outline-variant/10 font-body-md text-body-md text-on-surface-variant">
                Por el momento, solo agregamos propiedades publicadas por inmobiliarias registradas de Gualeguaychú para garantizar la seguridad y profesionalidad de las publicaciones. En caso de que quiera publicar una propiedad, póngase en contacto con nosotros escribiendo a <a href="mailto:alquileresgualeguaychu@protonmail.com" className="text-secondary hover:underline">alquileresgualeguaychu@protonmail.com</a>.
              </div>
            </details>
            
            <details className="border border-outline-variant/30 rounded-lg bg-surface group">
              <summary className="font-headline-md text-headline-md text-primary text-lg p-6 cursor-pointer list-none flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                <span>Soy Inmobiliaria, ¿cómo agrego mis propiedades?</span>
                <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>
              <div className="p-6 pt-0 border-t border-outline-variant/10 font-body-md text-body-md text-on-surface-variant">
                Para que sus propiedades aparezcan en nuestro portal, comuníquese con nosotros a través de la página de Contacto. Realizaremos una integración automatizada para que su catálogo se actualice diariamente en nuestro sitio sin esfuerzo manual.
              </div>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}
