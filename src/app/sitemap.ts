import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://github.com/Amanuel-Tesfaye-R/opencode-usage-tracking";

  const pages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/sessions", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/sessions/[id]", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/tools", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/projects", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/models", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/files", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/todos", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/agents", priority: 0.7, changeFrequency: "weekly" as const },
  ];

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
