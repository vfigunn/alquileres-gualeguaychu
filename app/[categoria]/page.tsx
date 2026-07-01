import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { CategoryFilter } from "@/components/CategoryFilter";
import { PropertyStats } from "@/components/PropertyStats";

const CATEGORIES: Record<
  string,
  {
    label: string;
    labelPlural: string;
    type: string;
    title: string;
    description: string;
    longDescription: string;
    breadcrumbLabel: string;
  }
> = {
  departamentos: {
    label: "departamento",
    labelPlural: "departamentos",
    type: "departamento",
    title: "Departamentos en alquiler en Gualeguaychú",
    description:
      "Encontrá departamentos en alquiler en Gualeguaychú. Monoambientes, dúplex, departamentos céntricos y en los mejores barrios. Todas las inmobiliarias en un solo lugar.",
    longDescription:
      "Explorá nuestra selección completa de departamentos en alquiler en Gualeguaychú. Desde acogedores monoambientes ideales para estudiantes o solteros, hasta amplios dúplex y departamentos familiares en zonas residenciales. Centralizamos las publicaciones de todas las inmobiliarias de la ciudad para que encuentres el hogar perfecto sin tener que recorrer decenas de sitios. Cada publicación incluye fotos reales, precio actualizado y datos de contacto directo con la inmobiliaria.",
    breadcrumbLabel: "Departamentos",
  },
  casas: {
    label: "casa",
    labelPlural: "casas",
    type: "casa",
    title: "Casas en alquiler en Gualeguaychú",
    description:
      "Encontrá casas en alquiler en Gualeguaychú. Casas con jardín, en barrios cerrados, céntricas y en zonas tranquilas. El portal más completo de alquileres de la ciudad.",
    longDescription:
      "Descubrí todas las casas en alquiler disponibles en Gualeguaychú. Ya sea que busques una casa con jardín para la familia, una propiedad en un barrio cerrado con seguridad, o una casa céntrica cerca de la avenida, nuestro listado reúne todas las opciones disponibles del mercado. Actualizamos las publicaciones diariamente para que siempre veas las propiedades más recientes. Cada casa incluye información detallada sobre cantidad de dormitorios, baños, superficie y servicios.",
    breadcrumbLabel: "Casas",
  },
  locales: {
    label: "local",
    labelPlural: "locales",
    type: "local",
    title: "Locales comerciales en alquiler en Gualeguaychú",
    description:
      "Encontrá locales comerciales en alquiler en Gualeguaychú. Ideal para emprendedores, comercios y oficinas en las mejores zonas comerciales de la ciudad.",
    longDescription:
      "Buscás un local comercial en Gualeguaychú para tu emprendimiento? Reunimos todas las ofertas de locales en alquiler, desde pequeños espacios en galerías céntricas hasta amplios locales sobre avenidas principales. Filtralos por ubicación, precio y superficie para encontrar exactamente lo que necesitás para tu negocio. Trabajamos con todas las inmobiliarias locales para ofrecerte la mayor variedad de opciones.",
    breadcrumbLabel: "Locales",
  },
  terrenos: {
    label: "terreno",
    labelPlural: "terrenos",
    type: "terreno",
    title: "Terrenos en alquiler en Gualeguaychú",
    description:
      "Encontrá terrenos en alquiler en Gualeguaychú. Ideales para construir, guardar vehículos o desarrollar proyectos. Todas las opciones disponibles.",
    longDescription:
      "Explorá los terrenos en alquiler disponibles en Gualeguaychú y sus alrededores. Ya sea que necesites un espacio para guardar vehículos, maquinaria, o planificar una construcción futura, nuestro portal centraliza todas las ofertas de las inmobiliarias de la ciudad. Conocé las dimensiones, ubicación y condiciones de cada terreno antes de contactar al propietario.",
    breadcrumbLabel: "Terrenos",
  },
};

const VALID_CATEGORIES = Object.keys(CATEGORIES);

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((categoria) => ({ categoria }));
}

export async function generateMetadata({
  params,
}: {
  params: { categoria: string };
}): Promise<Metadata> {
  const cat = CATEGORIES[params.categoria];
  if (!cat) {
    return { title: "Página no encontrada" };
  }

  return {
    title: cat.title,
    description: cat.description,
    alternates: {
      canonical: `https://alquileresgualeguaychu.com.ar/${params.categoria}`,
    },
    openGraph: {
      title: `${cat.title} | Alquileres Gualeguaychú`,
      description: cat.description,
      url: `https://alquileresgualeguaychu.com.ar/${params.categoria}`,
    },
  };
}

async function CategoryStats({ tipo }: { tipo: string }) {
  try {
    const { count } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("hidden", false)
      .eq("property_type", tipo);

    const { data: priceData } = await supabase
      .from("properties")
      .select("price_ars")
      .eq("hidden", false)
      .eq("property_type", tipo)
      .gt("price_ars", 0)
      .order("price_ars", { ascending: true });

    const countVal = count ?? 0;
    const prices = (priceData ?? []).map((r) => r.price_ars).filter(Boolean) as number[];
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
    const avgPrice =
      prices.length > 0
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : null;

    return (
      <p className="font-manrope text-body-md text-on-surface-variant mt-2">
        {countVal} {countVal === 1 ? "propiedad disponible" : "propiedades disponibles"}
        {avgPrice
          ? ` · Precio promedio $${avgPrice.toLocaleString("es-AR")} ARS`
          : ""}
        {minPrice && maxPrice
          ? ` ($${minPrice.toLocaleString("es-AR")} – $${maxPrice.toLocaleString(
              "es-AR"
            )})`
          : ""}
      </p>
    );
  } catch {
    return null;
  }
}

export default async function CategoriaPage({
  params,
}: {
  params: { categoria: string };
}) {
  const cat = CATEGORIES[params.categoria];
  if (!cat) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <h1 className="font-ebGaramond text-headline-lg text-primary mb-4">
          Categoría no encontrada
        </h1>
        <Link
          href="/"
          className="font-manrope text-label-md bg-gold text-black px-6 py-2 rounded-lg"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-w-0">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Inicio",
                item: "https://alquileresgualeguaychu.com.ar",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: cat.breadcrumbLabel,
              },
            ],
          }),
        }}
      />

      {/* Hero Section — SSR content visible to AI crawlers */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30 mt-8">
        <h1 className="font-ebGaramond text-headline-lg-mobile md:text-display-lg text-primary mb-4">
          {cat.title}
        </h1>
        <p className="font-manrope text-body-lg text-on-surface-variant mb-4 max-w-3xl">
          {cat.longDescription}
        </p>

        <Suspense fallback={null}>
          <CategoryStats tipo={cat.type} />
        </Suspense>

        {/* CTA — navigates to homepage with tipo filter */}
        <div className="mt-8">
          <Link
            href={`/?tipo=${cat.type}`}
            className="inline-flex font-manrope text-label-md bg-gold text-black px-8 py-3 rounded-xl hover:bg-gold-dark transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Ver todos los {cat.labelPlural}
          </Link>
          <Link
            href="/"
            className="inline-flex font-manrope text-label-md text-on-surface-variant ml-4 px-8 py-3 rounded-xl border border-outline-variant/30 hover:bg-surface-container transition-all"
          >
            Ver todas las propiedades
          </Link>
        </div>
      </div>

      {/* SEO Content Section — more detail for AI crawlers */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-lg">
        <div className="md:col-span-2">
          <h2 className="font-ebGaramond text-headline-md text-primary mb-4">
            ¿Por qué usar nuestro buscador?
          </h2>
          <div className="font-manrope text-body-md text-on-surface-variant space-y-4">
            <p>
              Encontrar{" "}
              <strong>
                {cat.labelPlural} en alquiler en Gualeguaychú
              </strong>{" "}
              puede ser abrumador cuando tenés que revisar página por página de
              cada inmobiliaria. Por eso centralizamos todas las publicaciones
              en un solo lugar, con información estandarizada y actualizada
              diariamente.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Actualización diaria:</strong> Las propiedades se
                actualizan automáticamente desde los sistemas de las
                inmobiliarias.
              </li>
              <li>
                <strong>Filtros inteligentes:</strong> Buscá por barrio, rango
                de precio, cantidad de dormitorios y más.
              </li>
              <li>
                <strong>Contacto directo:</strong> Cada propiedad te lleva al
                anuncio original en la inmobiliaria publicante.
              </li>
              <li>
                <strong>Sin comisiones:</strong> Somos un portal de búsqueda,
                no cobramos comisiones a inquilinos.
              </li>
            </ul>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/30">
          <h3 className="font-ebGaramond text-headline-sm text-primary mb-3">
            Buscar por
          </h3>
          <ul className="space-y-2">
            {VALID_CATEGORIES.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/${slug}`}
                  className={`font-manrope text-label-md block py-2 px-4 rounded-lg transition-colors ${
                    slug === params.categoria
                      ? "bg-gold/10 text-gold font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-gold"
                  }`}
                >
                  {CATEGORIES[slug].breadcrumbLabel}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/"
                className="font-manrope text-label-md block py-2 px-4 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-gold transition-colors"
              >
                Todas las propiedades
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Category-specific FAQ — citable by AI */}
      <section className="mt-12 mb-16">
        <h2 className="font-ebGaramond text-headline-md text-primary mb-6">
          Preguntas frecuentes sobre alquiler de {cat.labelPlural}
        </h2>

        <div className="space-y-4 max-w-3xl">
          <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
            <h3 className="font-manrope text-label-lg text-primary font-semibold mb-2">
              ¿Cuánto cuesta alquilar un {cat.label} en Gualeguaychú?
            </h3>
            <p className="font-manrope text-body-md text-on-surface-variant">
              El precio de alquiler de {cat.labelPlural} en Gualeguaychú varía
              según la ubicación, tamaño y estado de la propiedad. En nuestro
              portal podés filtrar por rango de precio para encontrar opciones
              que se ajusten a tu presupuesto, desde las más económicas hasta
              propiedades premium.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
            <h3 className="font-manrope text-label-lg text-primary font-semibold mb-2">
              ¿Qué requisitos piden para alquilar un {cat.label}?
            </h3>
            <p className="font-manrope text-body-md text-on-surface-variant">
              Los requisitos típicos incluyen garantía (propietaria, seguro de
              caución o aval bancario), recibo de sueldo o comprobante de
              ingresos, y DNI. Cada inmobiliaria puede tener requisitos
              específicos que se detallan en el anuncio original.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30">
            <h3 className="font-manrope text-label-lg text-primary font-semibold mb-2">
              ¿Se actualizan seguido las publicaciones?
            </h3>
            <p className="font-manrope text-body-md text-on-surface-variant">
              Sí. Nuestro sistema actualiza las propiedades automáticamente
              desde las inmobiliarias cada pocas horas. Las propiedades que ya
              no están disponibles se marcan como no vigentes para que siempre
              veas opciones reales.
            </p>
          </div>
        </div>
      </section>

      {/* Client filter for search results */}
      <CategoryFilter tipo={cat.type} />
    </div>
  );
}
