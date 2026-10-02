import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Feedback from '@/lib/models/Feedback';
import Views from '@/components/Views';
import LikeButton from '@/components/LikeButton';
import FeedbackSection from '@/components/projects/FeedbackSection';
import { SafeImage } from '@/components/ui/safe-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isValidObjectId } from 'mongoose';
import markdownit from 'markdown-it';
import { Github, Globe, ExternalLink, Calendar, Eye, FileText, Code2, Tag, Share2, CornerDownRight } from 'lucide-react';
import { Metadata } from 'next';

const md = markdownit({ html: true, linkify: true });

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO Metadata Generation
export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();

  const query = isValidObjectId(slug)
    ? Project.findById(slug)
    : Project.findOne({ slug });

  const project = await query.select('title description coverImage image').lean();
  if (!project || Array.isArray(project)) {
    return {
      title: 'Project Not Found | ProjectHub',
    };
  }

  const title = (project as any).title;
  const desc = (project as any).description;
  const img = (project as any).coverImage || (project as any).image || '';

  return {
    title: `${title} | ProjectHub`,
    description: desc,
    openGraph: {
      title: `${title} | ProjectHub`,
      description: desc,
      images: img ? [{ url: img }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ProjectHub`,
      description: desc,
      images: img ? [img] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const session = await auth();

  await dbConnect();

  // Find project by slug or object ID
  const projectQuery = isValidObjectId(slug)
    ? Project.findById(slug)
    : Project.findOne({ slug });

  const doc = await projectQuery
    .populate('author', '_id name username image email github portfolio bio')
    .lean();

  if (!doc || Array.isArray(doc)) return notFound();

  const project: any = {
    _id: String(doc._id),
    _createdAt: doc._createdAt?.toISOString?.() || new Date(doc.createdAt || Date.now()).toISOString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    category: doc.category,
    image: doc.image || doc.coverImage,
    coverImage: doc.coverImage || doc.image,
    details: doc.details || "",
    views: doc.views || 0,
    author: doc.author && {
      _id: String(doc.author._id),
      name: doc.author.name,
      username: doc.author.username,
      image: doc.author.image,
      email: doc.author.email,
      github: doc.author.github || "",
      portfolio: doc.author.portfolio || "",
      bio: doc.author.bio,
    },
    likes: Array.isArray(doc.likes) ? doc.likes.map((x: any) => String(x)) : [],
    technologies: doc.technologies || [],
    githubUrl: doc.githubUrl || "",
    liveUrl: doc.liveUrl || "",
    documentationUrl: doc.documentationUrl || "",
    screenshots: doc.screenshots || [],
    status: doc.status || "Published",
  };

  // Fetch feedbacks for this project
  const feedbackDocs = await Feedback.find({ project: project._id })
    .sort({ _createdAt: -1 })
    .populate('user', '_id name username image')
    .lean();

  const feedbacks = feedbackDocs.map((f: any) => ({
    _id: String(f._id),
    name: f.name || (f.user && f.user.name) || "Anonymous",
    email: f.email || "",
    message: f.message,
    rating: f.rating,
    user: f.user ? String(f.user._id) : undefined,
    _createdAt: f._createdAt?.toISOString?.() || new Date(f.createdAt || Date.now()).toISOString(),
  }));

  const parsedContent = md.render(project.details || "");
  const likedByMe = session?.id ? project.likes.includes(String(session.id)) : false;
  const isProjectOwner = session?.id === String(project.author?._id);

  const formattedDate = new Date(project._createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
      {/* Back Button */}
      <div>
        <Link href="/projects" className="text-sm font-semibold text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors">
          <CornerDownRight className="w-4 h-4 rotate-180" />
          <span>Back to Projects</span>
        </Link>
      </div>

      {/* Main Grid Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Cover Image & Screenshots */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 shadow-sm">
            <SafeImage
              src={project.coverImage || project.image || ''}
              alt={project.title}
              width={800}
              height={450}
              priority
              className="w-full h-full object-cover"
              fallbackSrc="https://placehold.co/800x450/e2e8f0/64748b?text=Cover+Image"
            />
          </div>

          {/* Screenshots Gallery */}
          {project.screenshots && project.screenshots.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Screenshots</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {project.screenshots.map((shot: string, idx: number) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-150 dark:border-gray-850 shadow-sm hover:opacity-90 transition-opacity cursor-pointer">
                    <SafeImage
                      src={shot}
                      alt={`${project.title} screenshot ${idx + 1}`}
                      width={300}
                      height={170}
                      className="w-full h-full object-cover"
                      fallbackSrc="https://placehold.co/300x170/e2e8f0/64748b?text=Screenshot"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel & Meta Details */}
        <div className="space-y-6">
          {/* Project Details Sidebar Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-100/50">
                {project.category}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                {project.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {project.description}
              </p>
            </div>

            {/* Actions: Likes, Views, GitHub, Live Demo */}
            <div className="flex items-center gap-3">
              <LikeButton
                projectId={project._id}
                initialLiked={likedByMe}
                initialCount={project.likes.length}
              />
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full text-xs font-bold flex items-center justify-center gap-1.5 py-2.5">
                    <Github className="w-4 h-4" />
                    <span>Repository</span>
                  </Button>
                </a>
              )}
            </div>

            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 flex items-center justify-center gap-1.5 shadow-sm shadow-blue-500/20">
                  <Globe className="w-4 h-4" />
                  <span>Launch Live Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            )}

            {project.documentationUrl && (
              <a href={project.documentationUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-semibold text-blue-500 hover:underline">
                View Documentation
              </a>
            )}

            <hr className="border-gray-100 dark:border-gray-850" />

            {/* Creator Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                Created By
              </h4>
              {project.author ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-50 border border-gray-100 dark:border-gray-800">
                    <SafeImage
                      src={project.author.image || ''}
                      alt={project.author.name || 'Author'}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      fallbackSrc="/logo.png"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/creators/${project.author.username}`} className="block text-sm font-bold text-gray-900 dark:text-white hover:text-blue-500 transition-colors truncate">
                      {project.author.name}
                    </Link>
                    <span className="block text-xs text-blue-500 font-medium">
                      @{project.author.username}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-400">Creator details unavailable</div>
              )}
            </div>

            <hr className="border-gray-100 dark:border-gray-850" />

            {/* Meta tags: date & status */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Published {formattedDate}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                project.status === "Published" ? "bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-450" : "bg-yellow-50 text-yellow-600"
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details and Feedback Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Project Description Detail (Markdown) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-8 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-850 pb-4">
              Project Details
            </h3>

            {/* Render markdown content */}
            {parsedContent ? (
              <article
                className="prose dark:prose-invert max-w-none font-medium text-sm md:text-base text-gray-600 dark:text-gray-300 break-words leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: parsedContent }}
              />
            ) : (
              <p className="text-gray-400 text-sm">No detailed description provided by the creator.</p>
            )}

            {/* Tech Badges listing */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="pt-6 border-t border-gray-100 dark:border-gray-850 space-y-3">
                <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Built With
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech: string, idx: number) => (
                    <Link key={idx} href={`/projects?tech=${encodeURIComponent(tech)}`}>
                      <Badge variant="secondary" className="px-3 py-1 font-bold text-xs cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors">
                        {tech}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <FeedbackSection
            projectId={project._id}
            initialFeedbacks={feedbacks}
            currentUserId={session?.id || null}
            isProjectOwner={isProjectOwner}
          />
        </div>
      </div>

      {/* Views count tracker in the corner */}
      <Suspense fallback={<></>}>
        <Views id={project._id} />
      </Suspense>
    </div>
  );
}
