import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://github.com/Amanuel-Tesfaye-R/opencode-insights";

  const pages = [
    "",
    "/sessions",
    "/tools",
    "/projects",
    "/models",
    "/files",
    "/todos",
    "/agents",
  ];

  return pages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : 0.8,
  }));
}
