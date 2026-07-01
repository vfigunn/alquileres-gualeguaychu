import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contacto | Alquileres Gualeguaychú",
  description:
    "Comunicate con nuestro equipo para integrar tu inmobiliaria al buscador de alquileres de Gualeguaychú. Departamentos, casas y locales en un solo portal.",
  openGraph: {
    title: "Contacto | Alquileres Gualeguaychú",
    description:
      "Comunicate con nuestro equipo para integrar tu inmobiliaria al buscador de alquileres de Gualeguaychú. Departamentos, casas y locales en un solo portal.",
  },
};

export default function ContactoPage() {
  return (
    <div className="w-full flex flex-col min-w-0">
      {/* Hero Section */}
      <section className="w-full bg-surface-container-lowest pt-xl pb-lg px-gutter border-b border-outline-variant/30 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display-lg text-display-lg text-primary mb-sm">
            Contacto Comercial
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            ¿Representas a una inmobiliaria en Gualeguaychú? Escríbenos para integrar tu catálogo de propiedades a nuestro buscador de forma automatizada y aumentar tu visibilidad. No respondemos consultas sobre propiedades específicas.
          </p>
        </div>
      </section>

      {/* Form Layout */}
      <section className="max-w-3xl mx-auto w-full px-gutter py-xl flex flex-col gap-lg">
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant/30 relative overflow-hidden">
          <h2 className="font-headline-md text-headline-md text-primary mb-lg">
            Contacto
          </h2>
          <ContactForm />
        </div>

        <div className="text-center mt-4">
          <p className="font-body-md text-body-md text-on-surface-variant mb-2">
            O envíenos un correo directamente a:
          </p>
          <a
            className="font-headline-md text-headline-md text-primary hover:text-secondary transition-colors break-all font-semibold"
            href="mailto:alquileresgualeguaychu@protonmail.com"
          >
            alquileresgualeguaychu@protonmail.com
          </a>
        </div>
      </section>
    </div>
  );
}
