import type { MetadataRoute } from "next";
import { listarTerreiros } from "@/lib/terreiros";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://appaxe.com.br";

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/terreiros`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/mapa`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Páginas dinâmicas de terreiros
  let terreiroPages: MetadataRoute.Sitemap = [];
  try {
    const terreiros = await listarTerreiros();
    terreiroPages = terreiros
      .filter((t) => t.isVerified === 1 && t.ativo === 1)
      .map((t) => ({
        url: `${baseUrl}/terreiros/${t.id}`,
        lastModified: new Date(t.updatedAt),
        changeFrequency: "weekly" as const,
        priority: t.plano === "diamante" ? 0.8 : t.plano === "ouro" ? 0.7 : 0.6,
      }));
  } catch {
    // Silenciar erro — sitemap estático continua funcionando
  }

  return [...staticPages, ...terreiroPages];
}
