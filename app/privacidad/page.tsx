import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad | Alquileres Gualeguaychú",
  description:
    "Política de privacidad de Alquileres Gualeguaychú. Conocé cómo manejamos tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <div className="w-full flex flex-col min-w-0">
      {/* Hero */}
      <section className="w-full bg-surface-container-lowest pt-xl pb-lg px-gutter border-b border-outline-variant/30 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display-lg text-display-lg text-primary mb-sm">
            Política de Privacidad
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            La transparencia en el tratamiento de tus datos es una prioridad para nosotros.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant/60 mt-4">
            Última actualización: 28 de junio de 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto w-full px-gutter py-xl">
        <div className="bg-surface-container-lowest p-lg md:p-xl rounded-xl border border-outline-variant/30 space-y-lg">
          <Article title="1. Responsable del tratamiento">
            <p>
              <strong>Alquileres Gualeguaychú</strong> es el responsable del tratamiento de los datos personales 
              recabados a través de este sitio web. Para cualquier consulta relacionada con la privacidad, 
              puede contactarnos a través de nuestra página de{" "}
              <Link href="/contacto" className="text-secondary hover:underline font-semibold">Contacto</Link>{" "}
              o por correo electrónico a{" "}
              <a href="mailto:alquileresgualeguaychu@protonmail.com" className="text-secondary hover:underline">
                alquileresgualeguaychu@protonmail.com
              </a>.
            </p>
          </Article>

          <Article title="2. Datos que recopilamos">
            <p>Recopilamos la siguiente información cuando usted utiliza nuestro sitio:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>
                <strong>Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas, 
                duración de la visita y datos de uso generales del sitio.
              </li>
              <li>
                <strong>Datos del formulario de contacto:</strong> nombre, correo electrónico, teléfono, 
                nombre de la inmobiliaria y mensaje, únicamente cuando usted completa voluntariamente 
                el formulario de contacto.
              </li>
              <li>
                <strong>Preferencias de búsqueda:</strong> almacenamos temporalmente en su navegador 
                (sessionStorage) los filtros y ordenamientos que aplica a la búsqueda para mejorar 
                su experiencia de navegación.
              </li>
            </ul>
          </Article>

          <Article title="3. Finalidad del tratamiento">
            <p>Sus datos son tratados con las siguientes finalidades:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Permitir el correcto funcionamiento y visualización del sitio web.</li>
              <li>Atender y responder a las consultas recibidas a través del formulario de contacto.</li>
              <li>Gestionar solicitudes de integración de catálogos de inmobiliarias.</li>
              <li>Mejorar la experiencia de usuario mediante el análisis de navegación.</li>
              <li>Cumplir con obligaciones legales aplicables.</li>
            </ul>
          </Article>

          <Article title="4. Base legal del tratamiento">
            <p>
              El tratamiento de sus datos se basa en su consentimiento (al completar el formulario de contacto) 
              y en el interés legítimo de mejorar y mantener nuestro servicio. Los datos de navegación se 
              tratan sobre la base de nuestro interés legítimo en analizar el uso del sitio.
            </p>
          </Article>

          <Article title="5. Conservación de los datos">
            <p>
              Conservamos los datos del formulario de contacto durante el tiempo necesario para atender 
              su consulta y hasta un máximo de 2 años después de la última interacción. Los datos de 
              navegación se conservan por un período máximo de 12 meses. Los datos almacenados en 
              sessionStorage se eliminan automáticamente al cerrar el navegador.
            </p>
          </Article>

          <Article title="6. Destinatarios de los datos">
            <p>
              No cedemos sus datos personales a terceros, excepto cuando sea necesario para cumplir 
              con obligaciones legales. Los datos del formulario de contacto son enviados a través del 
              servicio Resend (procesador de correo electrónico) a nuestra casilla de correo. 
              No compartimos datos con fines publicitarios ni comerciales.
            </p>
          </Article>

          <Article title="7. Derechos del usuario">
            <p>
              De conformidad con la Ley de Protección de Datos Personales (Ley 25.326 de la República Argentina), 
              usted tiene derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Acceder</strong> a sus datos personales tratados por nosotros.</li>
              <li><strong>Rectificar</strong> datos inexactos o incompletos.</li>
              <li><strong>Solicitar la supresión</strong> de sus datos cuando ya no sean necesarios.</li>
              <li><strong>Oponerse</strong> al tratamiento de sus datos para fines específicos.</li>
            </ul>
            <p className="mt-3">
              Para ejercer estos derechos, contáctenos a través de{" "}
              <a href="mailto:alquileresgualeguaychu@protonmail.com" className="text-secondary hover:underline">
                alquileresgualeguaychu@protonmail.com
              </a>{" "}
              o mediante nuestra página de{" "}
              <Link href="/contacto" className="text-secondary hover:underline font-semibold">Contacto</Link>.
            </p>
          </Article>

          <Article title="8. Seguridad">
            <p>
              Implementamos medidas técnicas y organizativas adecuadas para proteger sus datos personales 
              contra acceso no autorizado, pérdida, alteración o divulgación. Sin embargo, ninguna transmisión 
              por Internet es completamente segura, por lo que no podemos garantizar la seguridad absoluta 
              de los datos transmitidos.
            </p>
          </Article>

          <Article title="9. Cookies">
            <p>
              Este sitio web utiliza cookies técnicas necesarias para el funcionamiento del sitio y 
              sessionStorage para recordar sus preferencias de búsqueda durante la sesión. No utilizamos 
              cookies de rastreo, publicitarias ni de terceros. Para más información, consulte nuestra{" "}
              <Link href="/cookies" className="text-secondary hover:underline font-semibold">
                Política de Cookies
              </Link>.
            </p>
          </Article>

          <Article title="10. Modificaciones">
            <p>
              Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. 
              Le recomendamos revisar esta página periódicamente para estar informado de cualquier cambio. 
              La fecha de la última actualización se indica al inicio de esta página.
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
