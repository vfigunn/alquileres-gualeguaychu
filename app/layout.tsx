import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import TopNavBar from "@/components/TopNavBar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://alquileresgualeguaychu.com.ar"),
  title: {
    default: "Alquileres Gualeguaychú | Todas las propiedades en alquiler en un solo lugar",
    template: "%s | Alquileres Gualeguaychú",
  },
  description:
    "Encontrá todas las propiedades en alquiler de Gualeguaychú en un solo lugar. Centralizamos departamentos, casas, locales y más de todas las inmobiliarias de la ciudad.",
  keywords: [
    "alquileres gualeguaychú",
    "inmobiliarias gualeguaychú",
    "departamentos en alquiler gualeguaychú",
    "casas en alquiler gualeguaychú",
    "alquiler gualeguaychu",
    "propiedades gualeguaychu",
    "alquileres entre rios",
    "alquiler temporario gualeguaychú",
    "monoambiente gualeguaychú",
    "casa en alquiler gualeguaychú",
    "inmobiliaria gualeguaychú",
    "alquilar en gualeguaychú",
    "departamento centrico gualeguaychú",
    "alquiler casa barrio gualeguaychú",
    "propiedades alquiler entre rios",
  ],
  authors: [{ name: "Alquileres Gualeguaychú" }],
  openGraph: {
    title: "Alquileres Gualeguaychú | Todas las propiedades en alquiler en un solo lugar",
    description:
      "Encontrá todas las propiedades en alquiler de Gualeguaychú en un solo lugar. Centralizamos departamentos, casas, locales y más de todas las inmobiliarias.",
    url: "https://alquileresgualeguaychu.com.ar",
    siteName: "Alquileres Gualeguaychú",
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Alquileres Gualeguaychú — Encontrá todos los alquileres en un solo lugar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alquileres Gualeguaychú",
    description:
      "Encontrá todas las propiedades en alquiler de Gualeguaychú en un solo lugar. Centralizamos departamentos, casas, locales y más.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://alquileresgualeguaychu.com.ar",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "theme-color": "#0a1b2c",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="light">
      <head>
        <link rel="preconnect" href="https://static.tokkobroker.com" />
        <link rel="dns-prefetch" href="https://static.tokkobroker.com" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body-md text-body-md antialiased min-h-screen flex flex-col bg-background text-on-background overflow-x-hidden">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://alquileresgualeguaychu.com.ar/#organization",
                  name: "Alquileres Gualeguaychú",
                  url: "https://alquileresgualeguaychu.com.ar",
                  logo: "https://alquileresgualeguaychu.com.ar/ag-logo-horizontal.png",
                  description:
                    "Portal que centraliza la oferta de alquileres de Gualeguaychú, Entre Ríos, Argentina.",
                  areaServed: {
                    "@type": "City",
                    name: "Gualeguaychú",
                    containedInPlace: {
                      "@type": "State",
                      name: "Entre Ríos",
                    },
                  },
                  contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "customer service",
                    url: "https://alquileresgualeguaychu.com.ar/contacto",
                    email: "alquileresgualeguaychu@protonmail.com",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://alquileresgualeguaychu.com.ar/#website",
                  name: "Alquileres Gualeguaychú",
                  description:
                    "Encontrá todas las propiedades en alquiler de Gualeguaychú en un solo lugar. Centralizamos departamentos, casas, locales y más.",
                  url: "https://alquileresgualeguaychu.com.ar",
                  publisher: {
                    "@type": "Organization",
                    "@id": "https://alquileresgualeguaychu.com.ar/#organization",
                  },
                  inLanguage: "es-AR",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: "https://alquileresgualeguaychu.com.ar/?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />

        {/* TopNavBar */}
        <TopNavBar />

        <main className="flex-grow pt-[130px] max-w-[2000px] mx-auto w-full px-gutter flex gap-lg pb-xl overflow-x-hidden">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full mt-xl bg-[#0a1b2c] border-t border-white/10 text-white/80 relative overflow-hidden flex-shrink-0">
          {/* Subtle gradient accent at the top of the footer */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A84C]/70 via-[#D4AF37]/70 to-[#C9A84C]/70"></div>
          
          <div className="max-w-container-max mx-auto px-gutter py-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-xl md:gap-lg mb-xl">
              {/* Brand and Description */}
              <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-md">
                <Link href="/" className="inline-flex items-center gap-2 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/ag-logo-horizontal.png" alt="Alquileres Gualeguaychú Logo" className="h-16 w-auto object-contain rounded-lg" />
                </Link>
                <p className="font-manrope text-body-md text-blue-200/80 leading-relaxed">
                  Encontrá todos los alquileres de Gualeguaychú en un solo lugar. Departamentos, casas, locales y más de todas las inmobiliarias de la ciudad.
                </p>
                <div className="flex gap-4 mt-sm">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-blue-200/80 hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="Facebook">
                    <span className="material-symbols-outlined text-[20px]">public</span>
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-blue-200/80 hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="Instagram">
                    <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                  </a>
                  <Link href="/contacto" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-blue-200/80 hover:text-white transition-all duration-300 hover:-translate-y-1" aria-label="Contacto">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </Link>
                </div>
              </div>

              {/* Spacing for layout */}
              <div className="hidden lg:block lg:col-span-2"></div>

              {/* Links Sections */}
              <div className="md:col-span-7 lg:col-span-6 grid grid-cols-2 gap-lg">
                <div className="flex flex-col gap-md">
                  <h3 className="font-manrope font-bold text-title-sm text-white">Explorar</h3>
                  <nav className="flex flex-col gap-sm font-manrope text-label-md">
                    <Link href="/?tipo=departamento" className="text-blue-200/80 hover:text-white transition-colors inline-flex w-fit group">
                      Departamentos <span className="material-symbols-outlined text-[16px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
                    </Link>
                    <Link href="/?tipo=casa" className="text-blue-200/80 hover:text-white transition-colors inline-flex w-fit group">
                      Casas <span className="material-symbols-outlined text-[16px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
                    </Link>
                    <Link href="/?tipo=local" className="text-blue-200/80 hover:text-white transition-colors inline-flex w-fit group">
                      Oficinas <span className="material-symbols-outlined text-[16px] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
                    </Link>
                  </nav>
                </div>
                
                <div className="flex flex-col gap-md">
                  <h3 className="font-manrope font-bold text-title-sm text-white">Links</h3>
                  <nav className="flex flex-col gap-sm font-manrope text-label-md">
                    <Link href="/como-funciona" className="text-blue-200/80 hover:text-white transition-colors inline-flex w-fit">
                      Cómo funciona
                    </Link>
                    <Link href="/contacto" className="text-blue-200/80 hover:text-white transition-colors inline-flex w-fit">
                      Contacto
                    </Link>
                  </nav>
                </div>
            </div>
          </div>

            <div className="pt-lg mt-lg border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-md">
              <div className="font-manrope text-label-sm text-blue-200/60">
                © {new Date().getFullYear()} Alquileres Gualeguaychú. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </footer>

        {/* Vercel Web Analytics */}
        <Analytics />

        {/* Vercel Speed Insights */}
        <SpeedInsights />
      </body>
    </html>
  );
}
