import React from 'react';
import { dbConnect } from '@/lib/mongodb';
import Author from '@/lib/models/Author';
import Project from '@/lib/models/Project';
import { notFound } from 'next/navigation';
import { SafeImage } from '@/components/ui/safe-image';
import { Badge } from '@/components/ui/badge';
import ProjectCard, { ProjectTypeCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Github, Globe, Twitter, Linkedin, Instagram, Mail, Calendar, Eye, Heart, FolderOpen, Code2 } from 'lucide-react';
import { auth } from '@/auth';
import Link from 'next/link';
import { isValidObjectId } from 'mongoose';

export const dynamic = 'force-dynamic';

interface CreatorProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function CreatorProfilePage({ params }: CreatorProfilePageProps) {
  const { username } = await params;
  const session = await auth();

  await dbConnect();

  // Find creator by username or ObjectId
  const creatorQuery = isValidObjectId(username)
    ? Author.findById(username)
    : Author.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });

  const creatorDoc = await creatorQuery.lean();
  if (!creatorDoc || Array.isArray(creatorDoc)) {
    return notFound();
  }

  const creator: any = {
    _id: String(creatorDoc._id),
    _createdAt: creatorDoc._createdAt?.toISOString?.() || new Date(creatorDoc.createdAt || Date.now()).toISOString(),
    name: creatorDoc.name || "Anonymous Developer",
    username: creatorDoc.username || "anonymous",
    image: creatorDoc.image || "",
    email: creatorDoc.email || "",
    bio: creatorDoc.bio || "Full-stack developer building cool things on ProjectHub.",
    instagram: creatorDoc.instagram || "",
    github: creatorDoc.github || "",
    portfolio: creatorDoc.portfolio || "",
    twitter: creatorDoc.twitter || "",
    linkedin: creatorDoc.linkedin || "",
  };

  // Get creator projects
  const projectDocs = await Project.find({ author: creator._id, status: { $ne: "Draft" } })
    .sort({ _createdAt: -1 })
    .lean();

  const projects: ProjectTypeCard[] = projectDocs.map((d: any) => ({
    _id: String(d._id),
    _createdAt: d._createdAt?.toISOString?.() || new Date(d.createdAt || Date.now()).toISOString(),
    title: d.title,
    slug: d.slug,
    description: d.description || d.shortDescription || "",
    category: d.category,
    image: d.image || d.coverImage,
    coverImage: d.coverImage || d.image,
    views: d.views || 0,
    author: creator,
    creator: creator,
    likes: Array.isArray(d.likes) ? d.likes.map((id: any) => String(id)) : [],
    technologies: d.technologies || [],
    githubUrl: d.githubUrl,
    liveUrl: d.liveUrl,
  }));

  // Popular projects (sorted by views + likes size)
  const popularProjects = [...projects]
    .sort((a, b) => ((b.views || 0) + (b.likes?.length || 0)) - ((a.views || 0) + (a.likes?.length || 0)))
    .slice(0, 3);

  // Dynamic Technologies set
  const techSet = new Set<string>();
  projects.forEach((p) => {
    (p.technologies || []).forEach((t) => techSet.add(t));
  });
  const creatorTech = Array.from(techSet);

  const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = projects.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  const joinDate = new Date(creator._createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  const isMe = session?.id === creator._id;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
      {/* Profile Header Block */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Creator Card */}
        <div className="w-full lg:w-1/3 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-50 border border-gray-100 dark:border-gray-800 shadow-sm relative">
              <SafeImage
                src={creator.image}
                alt={creator.name}
                width={112}
                height={112}
                className="w-full h-full object-cover"
                fallbackSrc="/logo.png"
                unoptimized
              />
            </div>
            
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {creator.name}
              </h1>
              <span className="text-xs text-blue-500 font-bold">
                @{creator.username}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              {creator.bio}
            </p>
          </div>

          <hr className="border-gray-100 dark:border-gray-850" />

          {/* User Contact & Social Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-gray-450 uppercase tracking-widest">
              Links & Contact
            </h4>
            
            <div className="space-y-2">
              {creator.github && (
                <a href={creator.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                  <Github className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">GitHub Profile</span>
                </a>
              )}
              {creator.portfolio && (
                <a href={creator.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">Portfolio / Website</span>
                </a>
              )}
              {creator.twitter && (
                <a href={creator.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                  <Twitter className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">Twitter / X</span>
                </a>
              )}
              {creator.linkedin && (
                <a href={creator.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                  <Linkedin className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">LinkedIn Profile</span>
                </a>
              )}
              {creator.instagram && (
                <a href={`https://instagram.com/${creator.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                  <Instagram className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">@{creator.instagram}</span>
                </a>
              )}
              {creator.email && (
                <a href={`mailto:${creator.email}`} className="flex items-center gap-2.5 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold">{creator.email}</span>
                </a>
              )}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-850" />

          {/* Creators Statistics */}
          <div className="grid grid-cols-3 gap-2 text-center bg-gray-50/50 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-850">
            <div>
              <span className="block text-lg font-extrabold text-gray-900 dark:text-white">{projects.length}</span>
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Projects</span>
            </div>
            <div className="border-x border-gray-100 dark:border-gray-800">
              <span className="block text-lg font-extrabold text-gray-900 dark:text-white">{totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}</span>
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Views</span>
            </div>
            <div>
              <span className="block text-lg font-extrabold text-gray-900 dark:text-white">{totalLikes}</span>
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Likes</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Calendar className="w-4 h-4 text-gray-300" />
            <span>Member since {joinDate}</span>
          </div>

          {isMe && (
            <div className="pt-2">
              <Link href="/settings">
                <Button variant="outline" className="w-full text-xs font-bold py-2">
                  Edit Profile Settings
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Projects & Tech List */}
        <div className="w-full lg:w-2/3 space-y-10">
          {/* Tech stack summary */}
          {creatorTech.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>Technologies Used</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {creatorTech.map((tech) => (
                  <Badge key={tech} variant="secondary" className="px-3 py-1 font-bold text-xs bg-gray-50 dark:bg-gray-850 text-gray-650 dark:text-gray-300 border-none">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Popular Projects Section */}
          {popularProjects.length > 0 && (
            <div className="space-y-5">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-gray-850 pb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500/10" />
                <span>Popular Projects</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {popularProjects.map((post) => (
                  <ProjectCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* All Projects Section */}
          <div className="space-y-5">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-gray-850 pb-3 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-500" />
              <span>All Projects ({projects.length})</span>
            </h3>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {projects.map((post) => (
                  <ProjectCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/10 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                <p className="text-sm text-gray-400">This creator hasn't published any projects yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
