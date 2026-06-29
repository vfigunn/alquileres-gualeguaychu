import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies | Alquileres Gualeguaychú",
  description:
    "Política de cookies de Alquileres Gualeguaychú. Información sobre el uso de cookies en nuestro portal.",
};

export default function CookiesPage() {
  return (
    <div className="w-full flex flex-col min-w-0">
      {/* Hero */}
      <section className="w-full bg-surface-container-lowest pt-xl pb-lg px-gutter border-b border-outline-variant/30 mt-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display-lg text-display-lg text-primary mb-sm">
            Política de Cookies
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Información clara y transparente sobre el uso de cookies en nuestro sitio.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant/60 mt-4">
            Última actualización: 28 de junio de 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto w-full px-gutter py-xl">
        <div className="bg-surface-container-lowest p-lg md:p-xl rounded-xl border border-outline-variant/30 space-y-lg">
          <Article title="1. ¿Qué son las cookies?">
            <p>
              Las cookies son pequeños archivos de texto que los sitios web almacenan en su navegador 
              cuando usted los visita. Permiten que el sitio recuerde sus preferencias y comportamiento 
              durante un período de tiempo. También utilizamos mecanismos similares como el 
              <strong> sessionStorage</strong> del navegador para mejorar su experiencia.
            </p>
          </Article>

          <Article title="2. Tipos de cookies que utilizamos">
            <p>En Alquileres Gualeguaychú utilizamos exclusivamente:</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30">
                    <th className="font-manrope font-semibold text-label-md text-primary py-3 pr-4">Tipo</th>
                    <th className="font-manrope font-semibold text-label-md text-primary py-3 pr-4">Finalidad</th>
                    <th className="font-manrope font-semibold text-label-md text-primary py-3">Duración</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface-variant">
                  <tr className="border-b border-outline-variant/20">
                    <td className="py-3 pr-4 font-medium text-primary">SessionStorage</td>
                    <td className="py-3 pr-4">Recordar filtros de búsqueda y ordenamiento durante la navegación</td>
                    <td className="py-3">Sesión (se elimina al cerrar el navegador)</td>
                  </tr>
                  <tr className="border-b border-outline-variant/20">
                    <td className="py-3 pr-4 font-medium text-primary">Cookies técnicas</td>
                    <td className="py-3 pr-4">Asegurar el funcionamiento básico del sitio (Next.js)</td>
                    <td className="py-3">Sesión</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Article>

          <Article title="3. Cookies de terceros">
            <p>
              <strong>No utilizamos cookies de terceros.</strong> No empleamos cookies de rastreo, 
              publicitarias, de redes sociales ni de servicios de análisis que requieran el 
              consentimiento del usuario. Las únicas cookies técnicas son las necesarias para 
              el correcto funcionamiento del sitio.
            </p>
          </Article>

          <Article title="4. Gestión de cookies">
            <p>
              Dado que solo utilizamos cookies técnicas y sessionStorage (necesarias para el 
              funcionamiento del sitio), no requerimos su consentimiento explícito. No obstante, 
              usted puede configurar su navegador para rechazar todas las cookies o para alertarle 
              cuando se envíe una cookie. Tenga en cuenta que algunas partes del sitio podrían 
              no funcionar correctamente si deshabilita las cookies.
            </p>
            <p className="mt-3">
              Puede gestionar las cookies desde la configuración de su navegador:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
              <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
              <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
              <li><strong>Edge:</strong> Configuración → Cookies y permisos</li>
            </ul>
          </Article>

          <Article title="5. SessionStorage">
            <p>
              Utilizamos el almacenamiento de sesión (<strong>sessionStorage</strong>) del navegador 
              para recordar temporalmente los filtros que aplicó a su búsqueda (tipo de propiedad, 
              rango de precios, barrio, etc.) y el criterio de ordenamiento. Esta información se 
              almacena únicamente en su navegador y se elimina automáticamente cuando cierra la 
              ventana o pestaña del sitio. No compartimos esta información con nadie.
            </p>
          </Article>

          <Article title="6. Actualizaciones">
            <p>
              Podemos actualizar esta Política de Cookies en cualquier momento. Le recomendamos 
              revisar esta página periódicamente. La fecha de la última actualización se indica 
              al inicio de esta página.
            </p>
          </Article>

          <Article title="7. Contacto">
            <p>
              Si tiene preguntas sobre nuestra Política de Cookies, puede contactarnos a través de 
              nuestra página de{" "}
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
