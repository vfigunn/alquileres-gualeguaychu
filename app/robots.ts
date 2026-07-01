import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cookies", "/privacidad", "/terminos"],
      },
    ],
    sitemap: "https://www.alquileresgualeguaychu.com.ar/sitemap.xml",
  };
}
