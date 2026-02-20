import { MetadataRoute } from "next";

const BASE_URL = "https://apprenticelog.nz";

// Trade pages for SEO
const TRADES = [
  "electrical",
  "plumbing",
  "carpentry",
  "automotive",
  "construction",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/employer-landing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/auth`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Trade-specific landing pages (high SEO value)
  const tradePages: MetadataRoute.Sitemap = TRADES.map((trade) => ({
    url: `${BASE_URL}/trades/${trade}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Trades index page
  const tradesIndex: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/trades`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  return [...staticPages, ...tradesIndex, ...tradePages];
}
