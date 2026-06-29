/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo servidor: requerido para API routes y paginación real con Supabase.
  // Si se necesita un export estático de páginas de detalle, se puede combinar
  // con generateStaticParams en app/propiedad/[id]/page.tsx.
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
