import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/cookies"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/api/", "/cookies"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/", "/cookies"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/cookies"],
      },
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: ["/api/", "/cookies"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cookies", "/privacidad", "/terminos"],
      },
    ],
    sitemap: "https://alquileresgualeguaychu.com.ar/sitemap.xml",
  };
}
