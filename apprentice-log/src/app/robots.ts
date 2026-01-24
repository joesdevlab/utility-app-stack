import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://apprenticelog.nz";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/pricing",
          "/employer-landing",
          "/trades",
          "/trades/*",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/app/*",      // Protected apprentice app
          "/employer/*", // Protected employer portal
          "/admin/*",    // Admin dashboard
          "/api/*",      // API routes
          "/auth/*",     // Auth flows (except main page)
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
