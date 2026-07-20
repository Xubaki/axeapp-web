import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/login", "/esqueci-senha", "/nova-senha"],
      },
    ],
    sitemap: "https://appaxe.com.br/sitemap.xml",
  };
}
