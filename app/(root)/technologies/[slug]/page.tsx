import React from 'react';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import ProjectCard, { ProjectTypeCard } from '@/components/ProjectCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface TechnologyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TechnologyDetailPage({ params }: TechnologyDetailPageProps) {
  const { slug } = await params;
  const techName = decodeURIComponent(slug);

  await dbConnect();

  const projectDocs = await Project.find({
    status: { $ne: "Draft" },
    technologies: { $regex: new RegExp(`^${techName}$`, 'i') }
  })
    .sort({ _createdAt: -1 })
    .populate('author', '_id name username image email bio')
    .lean();

  const posts: ProjectTypeCard[] = projectDocs.map((d: any) => ({
    _id: String(d._id),
    _createdAt: d._createdAt?.toISOString?.() || new Date(d.createdAt || Date.now()).toISOString(),
    title: d.title,
    slug: d.slug,
    description: d.description || d.shortDescription || "",
    category: d.category,
    image: d.image || d.coverImage,
    coverImage: d.coverImage || d.image,
    views: d.views || 0,
    author: d.author && {
      _id: String(d.author._id),
      name: d.author.name,
      username: d.author.username,
      image: d.author.image,
      email: d.author.email,
      bio: d.author.bio,
    },
    creator: d.author && {
      _id: String(d.author._id),
      name: d.author.name,
      username: d.author.username,
      image: d.author.image,
      email: d.author.email,
      bio: d.author.bio,
    },
    likes: Array.isArray(d.likes) ? d.likes.map((id: any) => String(id)) : [],
    technologies: d.technologies || [],
    githubUrl: d.githubUrl,
    liveUrl: d.liveUrl,
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Back navigation */}
      <div>
        <Link href="/technologies" className="text-sm font-semibold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>All Technologies</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-850 pb-5">
        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
          <Tag className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Built with {techName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse through {posts.length} {posts.length === 1 ? 'project' : 'projects'} utilizing this technology.
          </p>
        </div>
      </div>

      {/* Grid of Projects */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <ProjectCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-450 text-sm">No published projects are currently tagged with "{techName}".</p>
        </div>
      )}
    </div>
  );
}
