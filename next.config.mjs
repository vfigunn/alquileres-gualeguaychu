/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo servidor: requerido para API routes y paginación real con Supabase.
  // Si se necesita un export estático de páginas de detalle, se puede combinar
  // con generateStaticParams en app/propiedad/[id]/page.tsx.
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
