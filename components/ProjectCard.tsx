import React from 'react'
import Link from 'next/link'
import { Calendar, Eye, Heart, Github, ArrowRight, User } from 'lucide-react'
import { SafeImage } from './ui/safe-image'
import { Badge } from './ui/badge'

export type AuthorLite = {
  _id: string;
  name?: string | null;
  username?: string | null;
  image?: string | null;
  email?: string | null;
  instagram?: string | null;
  bio?: string | null;
};

export type ProjectTypeCard = {
  _id: string;
  _createdAt: string;
  title: string;
  slug?: string;
  description: string;
  category: string;
  image?: string | null;
  coverImage?: string | null;
  views?: number;
  author?: AuthorLite;
  creator?: AuthorLite; // support both creator and author alias
  likes?: any[];
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
};

interface ProjectCardProps {
  post: ProjectTypeCard;
}

export default function ProjectCard({ post }: ProjectCardProps) {
  const {
    _id,
    _createdAt,
    title,
    slug,
    description,
    category,
    image,
    coverImage,
    views = 0,
    author,
    creator,
    likes = [],
    technologies = [],
    githubUrl
  } = post;

  const displayAuthor = creator || author;
  const projectImage = coverImage || image;
  const formattedDate = new Date(_createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="group relative flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700/80 transition-all duration-300 h-full">
      {/* Category Tag overlay on image */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-[10px] uppercase font-bold tracking-wider bg-white/90 dark:bg-gray-900/90 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full border border-gray-100/50 dark:border-gray-800/50 backdrop-blur-sm">
          {category}
        </span>
      </div>

      {/* Project Image */}
      <Link href={`/projects/${slug || _id}`} className="block relative aspect-video overflow-hidden bg-gray-50 dark:bg-gray-950">
        <SafeImage
          src={projectImage || ''}
          alt={title}
          width={400}
          height={225}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          fallbackSrc="https://placehold.co/400x225/e2e8f0/64748b?text=Project"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title */}
        <Link href={`/projects/${slug || _id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-2 tracking-tight">
            {title}
          </h3>
        </Link>

        {/* Short Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed flex-1">
          {description}
        </p>

        {/* Technologies Badges */}
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 max-h-[58px] overflow-hidden">
            {technologies.slice(0, 3).map((tech, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-[10px] font-medium bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 border-none text-gray-600 dark:text-gray-300 py-0.5 px-2"
              >
                {tech}
              </Badge>
            ))}
            {technologies.length > 3 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium px-1 align-middle self-center">
                +{technologies.length - 3} more
              </span>
            )}
          </div>
        )}

        <hr className="border-gray-100 dark:border-gray-850 mb-4" />

        {/* Footer info: Creator & Stats */}
        <div className="flex items-center justify-between mt-auto">
          {/* Creator Profile */}
          {displayAuthor ? (
            <Link
              href={`/creators/${displayAuthor.username}`}
              className="flex items-center space-x-2 group/author hover:opacity-85 transition-opacity"
            >
              {displayAuthor.image ? (
                <SafeImage
                  src={displayAuthor.image}
                  alt={displayAuthor.name || 'Creator'}
                  width={24}
                  height={24}
                  className="rounded-full border border-gray-100 dark:border-gray-800"
                  fallbackSrc="/logo.png"
                  unoptimized
                />
              ) : (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 group-hover/author:text-blue-600 dark:group-hover/author:text-blue-400 truncate max-w-[80px]">
                {displayAuthor.name || displayAuthor.username}
              </span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="w-6 h-6 bg-gray-100 dark:bg-gray-850 rounded-full flex items-center justify-center">
                <User className="w-3 h-3" />
              </div>
              <span className="text-xs">Unknown</span>
            </div>
          )}

          {/* Likes & Views Stats */}
          <div className="flex items-center space-x-3 text-gray-400 dark:text-gray-500">
            <span className="flex items-center text-xs gap-1" title={`${likes.length} likes`}>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10" />
              <span>{likes.length}</span>
            </span>
            <span className="flex items-center text-xs gap-1" title={`${views} views`}>
              <Eye className="w-3.5 h-3.5" />
              <span>{views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}</span>
            </span>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 dark:hover:text-gray-350 transition-colors p-0.5"
                title="GitHub Repository"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* View Project Button on Hover / Card Footer CTA */}
        <div className="mt-4 pt-1 flex justify-end">
          <Link
            href={`/projects/${slug || _id}`}
            className="inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <span>View Project</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}