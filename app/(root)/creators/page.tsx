import React from 'react';
import { dbConnect } from '@/lib/mongodb';
import Author from '@/lib/models/Author';
import Project from '@/lib/models/Project';
import { SafeImage } from '@/components/ui/safe-image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { User, FolderOpen, ArrowRight, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CreatorsPage() {
  await dbConnect();

  const creatorsDoc = await Author.find().lean();

  const creators = await Promise.all(creatorsDoc.map(async (c: any) => {
    // Get projects count and technologies for this creator
    const projects = await Project.find({ author: c._id, status: { $ne: "Draft" } }).select('technologies').lean();
    
    // Calculate popular technologies
    const techCounts: Record<string, number> = {};
    projects.forEach((p: any) => {
      (p.technologies || []).forEach((t: string) => {
        techCounts[t] = (techCounts[t] || 0) + 1;
      });
    });

    const popularTech = Object.entries(techCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => entry[0]);

    return {
      _id: String(c._id),
      name: c.name || "Anonymous Developer",
      username: c.username || "anonymous",
      image: c.image || "",
      bio: c.bio || "Full-stack developer building cool things.",
      projectCount: projects.length,
      popularTech,
    };
  }));

  // Sort by project count
  creators.sort((a, b) => b.projectCount - a.projectCount);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Discover Creators
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Meet developers, designers, and builders in the ProjectHub community.
        </p>
      </div>

      {creators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {creators.map((c) => (
            <div
              key={c._id}
              className="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 h-full"
            >
              <div className="space-y-4">
                {/* Header: Avatar, Name, Username */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 border border-gray-100 dark:border-gray-800">
                    <SafeImage
                      src={c.image}
                      alt={c.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                      fallbackSrc="/logo.png"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/creators/${c.username}`}
                      className="block font-bold text-gray-900 dark:text-white hover:text-blue-500 transition-colors truncate"
                    >
                      {c.name}
                    </Link>
                    <span className="block text-xs text-blue-500 font-medium">
                      @{c.username}
                    </span>
                  </div>
                </div>

                {/* Short Bio */}
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                  {c.bio}
                </p>

                <hr className="border-gray-100 dark:border-gray-850" />

                {/* Creator Stats */}
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <FolderOpen className="w-4 h-4 text-gray-400" />
                  <span>{c.projectCount} {c.projectCount === 1 ? 'published project' : 'published projects'}</span>
                </div>

                {/* Tech Badges */}
                {c.popularTech.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Primary Stack</span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.popularTech.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-[10px] font-medium bg-gray-50 dark:bg-gray-850 text-gray-600 dark:text-gray-300 border-none">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* View Profile Button */}
              <div className="pt-6 mt-auto">
                <Link
                  href={`/creators/${c.username}`}
                  className="inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <span>View Profile</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No creators found yet.</p>
        </div>
      )}
    </div>
  );
}
