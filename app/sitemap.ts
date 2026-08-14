import { MetadataRoute } from 'next';
import { getAllSessions } from '@/lib/queries';

const BASE_URL = 'https://opencode-insights.dev';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sessions = getAllSessions(null);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/sessions`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/tools`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${BASE_URL}/projects`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/models`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/files`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/todos`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/agents`, changeFrequency: 'daily', priority: 0.7 },
  ];

  const sessionPages = sessions.slice(0, 500).map((session) => ({
    url: `${BASE_URL}/sessions/${session.id}`,
    lastModified: new Date(session.updatedAt),
    changeFrequency: 'never' as const,
    priority: 0.5 as const,
  }));

  return [...staticPages, ...sessionPages];
}
