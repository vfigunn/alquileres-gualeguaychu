import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Uso | Alquileres Gualeguaychú",
  description:
    "Términos y condiciones de uso del portal Alquileres Gualeguaychú, el agregador de propiedades en alquiler de Gualeguaychú.",
};

export default function TerminosPage() {
  return (
    <div className="w-full flex flex-col min-w-0">
      {/* Hero */}
      <section className="w-full bg-surface-container-lowest pt-xl pb-lg px-gutter border-b border-outline-variant/30 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display-lg text-display-lg text-primary mb-sm">
            Términos de Uso
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Al utilizar este sitio web aceptás los términos y condiciones detallados a continuación.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant/60 mt-4">
            Última actualización: 28 de junio de 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto w-full px-gutter py-xl">
        <div className="bg-surface-container-lowest p-lg md:p-xl rounded-xl border border-outline-variant/30 space-y-lg">
          <Article title="1. Aceptación de los términos">
            <p>
              Al acceder y utilizar el sitio web <strong>Alquileres Gualeguaychú</strong> (en adelante, &ldquo;el Portal&rdquo;), 
              usted acepta cumplir con los presentes Términos de Uso. Si no está de acuerdo con alguno de estos términos, 
              le solicitamos que no utilice el Portal.
            </p>
          </Article>

          <Article title="2. Descripción del servicio">
            <p>
              Alquileres Gualeguaychú es un portal agregador que recopila, estandariza y publica propiedades en alquiler 
              ofrecidas por inmobiliarias de la ciudad de Gualeguaychú, provincia de Entre Ríos, Argentina. 
              No somos una inmobiliaria ni intermediarios en operaciones de alquiler. No gestionamos contactos, 
              visitas, cobros ni firmas de contratos entre propietarios e inquilinos.
            </p>
          </Article>

          <Article title="3. Exactitud de la información">
            <p>
              La información publicada en el Portal es obtenida automáticamente desde los sitios web de las inmobiliarias 
              asociadas. Si bien nos esforzamos por mantener los datos actualizados y precisos, no garantizamos la 
              exactitud, integridad ni vigencia de la información. Los precios, disponibilidad y características de 
              las propiedades pueden cambiar sin previo aviso. Recomendamos verificar toda la información directamente 
              con la inmobiliaria correspondiente.
            </p>
          </Article>

          <Article title="4. Uso del sitio">
            <p>
              El usuario se compromete a utilizar el Portal de conformidad con la ley, la moral, el orden público y 
              estos Términos de Uso. Queda prohibido:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Utilizar el Portal para fines ilegales o no autorizados.</li>
              <li>Extraer, replicar o republicar los datos del Portal sin autorización expresa.</li>
              <li>Realizar scraping automatizado sin consentimiento previo por escrito.</li>
              <li>Introducir virus, código malicioso o cualquier otro elemento que pueda dañar el funcionamiento del sitio.</li>
            </ul>
          </Article>

          <Article title="5. Propiedad intelectual">
            <p>
              El diseño, logotipo, marca y código del Portal son propiedad de Alquileres Gualeguaychú. 
              Las imágenes de propiedades pertenecen a sus respectivas inmobiliarias y se utilizan bajo 
              los términos de acceso público de sus sitios web. Queda prohibida la reproducción total o 
              parcial del contenido sin autorización.
            </p>
          </Article>

          <Article title="6. Enlaces a terceros">
            <p>
              El Portal contiene enlaces a sitios web externos de inmobiliarias y otros servicios. 
              No nos responsabilizamos por el contenido, políticas de privacidad ni prácticas de estos sitios. 
              El acceso a dichos sitios es responsabilidad exclusiva del usuario.
            </p>
          </Article>

          <Article title="7. Limitación de responsabilidad">
            <p>
              Alquileres Gualeguaychú no será responsable por daños directos, indirectos, incidentales o 
              consecuentes derivados del uso o la imposibilidad de uso del Portal, incluyendo pero no 
              limitado a pérdidas económicas, pérdida de datos o daños por transacciones realizadas con 
              terceros a través de los enlaces publicados.
            </p>
          </Article>

          <Article title="8. Modificaciones">
            <p>
              Nos reservamos el derecho de modificar estos Términos de Uso en cualquier momento. 
              Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio. 
              Recomendamos revisar periódicamente esta página para mantenerse informado.
            </p>
          </Article>

          <Article title="9. Contacto">
            <p>
              Si tiene preguntas sobre estos Términos de Uso, puede comunicarse a través de nuestra 
              página de{" "}
              <Link href="/contacto" className="text-secondary hover:underline font-semibold">
                Contacto
              </Link>{" "}
              o por correo electrónico a{" "}
              <a href="mailto:alquileresgualeguaychu@protonmail.com" className="text-secondary hover:underline">
                alquileresgualeguaychu@protonmail.com
              </a>.
            </p>
          </Article>
        </div>
      </section>
    </div>
  );
}

function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article>
      <h2 className="font-headline-md text-headline-md text-primary mb-3">{title}</h2>
      <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed space-y-3">
        {children}
      </div>
    </article>
  );
}
