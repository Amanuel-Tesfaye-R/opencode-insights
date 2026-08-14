import { MetadataRoute } from "next";

const BASE_URL = "https://github.com/Amanuel-Tesfaye-R/opencode-usage-tracking";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
