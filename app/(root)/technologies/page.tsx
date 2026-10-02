import React from 'react';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Link from 'next/link';
import { ArrowRight, Code2, Library, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

const FALLBACK_TECH = [
  "React", "Next.js", "TypeScript", "Tailwind CSS", "Node.js", "Express", "MongoDB",
  "Python", "Rust", "Go", "Firebase", "PostgreSQL", "Java"
];

export default async function TechnologiesPage() {
  await dbConnect();

  // Aggregate distinct technologies with counts
  const techStats = await Project.aggregate([
    { $match: { status: { $ne: "Draft" } } },
    { $unwind: "$technologies" },
    {
      $group: {
        _id: "$technologies",
        projectCount: { $sum: 1 }
      }
    },
    { $sort: { projectCount: -1 } }
  ]);

  let technologies = techStats.map((t: any) => ({
    name: t._id,
    slug: encodeURIComponent(t._id),
    projectCount: t.projectCount
  }));

  // Fallback if database is empty
  if (technologies.length === 0) {
    technologies = FALLBACK_TECH.map(name => ({
      name,
      slug: encodeURIComponent(name),
      projectCount: 0
    }));
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
          <Library className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Discover by Technology
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse projects built with modern frameworks, languages, databases, and tools.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {technologies.map((tech) => (
          <Link
            key={tech.name}
            href={`/technologies/${tech.slug}`}
            className="group bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500/30 dark:hover:border-blue-500/20 transition-all duration-350"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tech.name}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            
            <div className="mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
              {tech.projectCount} {tech.projectCount === 1 ? 'project' : 'projects'}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
