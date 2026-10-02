import { MetadataRoute } from 'next';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Author from '@/lib/models/Author';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://projecthub.vercel.app';

  try {
    await dbConnect();

    // 1. Static Routes
    const staticRoutes = ['', '/projects', '/creators', '/technologies'].map(route => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1.0 : 0.8,
    }));

    // 2. Dynamic Projects URLs
    const projects = await Project.find({ status: 'Published' }).select('slug _updatedAt updatedAt').lean();
    const projectUrls = projects.map((p: any) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: new Date(p._updatedAt || p.updatedAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // 3. Dynamic Creators URLs
    const creators = await Author.find().select('username _updatedAt updatedAt').lean();
    const creatorUrls = creators.map((c: any) => ({
      url: `${baseUrl}/creators/${c.username}`,
      lastModified: new Date(c._updatedAt || c.updatedAt || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));

    return [...staticRoutes, ...projectUrls, ...creatorUrls];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    // Fallback to static routes if db connection fails during build time
    return ['', '/projects', '/creators', '/technologies'].map(route => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.5,
    }));
  }
}
