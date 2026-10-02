import React from 'react';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Author from '@/lib/models/Author';
import ProjectCard, { ProjectTypeCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, ArrowLeft, ArrowRight, Grid, LayoutList } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface ProjectsPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    tech?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const query = params.query || "";
  const category = params.category || "";
  const tech = params.tech || "";
  const sort = params.sort || "newest";
  const page = params.page || "1";

  await dbConnect();

  // Build match stage for MongoDB aggregation pipeline
  const matchStage: any = { status: { $ne: "Draft" } };
  
  if (category && category !== "All") {
    matchStage.category = category;
  }
  
  if (tech) {
    matchStage.technologies = { $regex: new RegExp(`^${tech}$`, 'i') };
  }

  if (query) {
    const regex = new RegExp(query, 'i');
    // Find matching authors
    const matchingAuthors = await Author.find({
      $or: [
        { name: regex },
        { username: regex }
      ]
    }).select('_id').lean();
    const authorIds = matchingAuthors.map(a => a._id);

    matchStage.$or = [
      { title: regex },
      { description: regex },
      { category: regex },
      { technologies: regex },
      { author: { $in: authorIds } }
    ];
  }

  // Count total matches
  const totalProjects = await Project.countDocuments(matchStage);

  // Setup aggregation pipeline for sorting by likes count (array length)
  const pipeline: any[] = [
    { $match: matchStage },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } }
      }
    }
  ];

  // Sorting
  let sortField: any = {};
  if (sort === "views") {
    sortField = { views: -1, _createdAt: -1 };
  } else if (sort === "likes") {
    sortField = { likesCount: -1, views: -1 };
  } else if (sort === "popular") {
    sortField = { views: -1, likesCount: -1 };
  } else {
    sortField = { _createdAt: -1 };
  }
  pipeline.push({ $sort: sortField });

  // Pagination
  const limit = 9;
  const pageNum = parseInt(page) || 1;
  const skip = (pageNum - 1) * limit;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // Run pipeline
  const docs = await Project.aggregate(pipeline);
  const populatedDocs = await Project.populate(docs, {
    path: 'author',
    select: '_id name username image email bio'
  });

  const posts: ProjectTypeCard[] = populatedDocs.map((d: any) => ({
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

  const totalPages = Math.ceil(totalProjects / limit);

  // List of categories
  const categories = [
    "All", "Web Development", "Mobile App", "AI/ML", "Blockchain", "IoT",
    "Game Development", "Data Science", "DevOps", "UI/UX", "Open Source"
  ];

  // Build sorting URL query string helper
  const getQueryUrl = (newParams: Record<string, string | number | null>) => {
    const updated = {
      query: query || null,
      category: category || null,
      tech: tech || null,
      sort: sort || null,
      page: page || null,
      ...newParams
    };
    
    const searchParts = [];
    for (const [key, value] of Object.entries(updated)) {
      if (value !== null && value !== "" && value !== "All") {
        searchParts.push(`${key}=${encodeURIComponent(String(value))}`);
      }
    }
    return `/projects${searchParts.length > 0 ? `?${searchParts.join('&')}` : ''}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Header and Search */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Explore Projects
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse and filter through amazing work uploaded by creators.
          </p>
        </div>

        {/* Global Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          <form action="/projects" method="GET" className="relative flex items-center bg-gray-50 hover:bg-gray-100/50 dark:bg-gray-900 dark:hover:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-xl w-full md:flex-1 transition-all duration-200">
            <Search className="w-5 h-5 text-gray-400 absolute left-4" />
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Search projects, stack, keywords or creator name..."
              className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-gray-900 dark:text-white text-sm"
            />
            {category && category !== "All" && <input type="hidden" name="category" value={category} />}
            {tech && <input type="hidden" name="tech" value={tech} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-between md:justify-start">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Sort By:</span>
            </div>
            <div className="relative inline-block text-left">
              <select
                className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 text-sm font-semibold rounded-lg px-3 py-2 outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
                value={sort}
                onChange={(e) => {
                  // Direct navigation in client via window.location in pure JS is simple and reliable for Server Components!
                  if (typeof window !== "undefined") {
                    window.location.href = getQueryUrl({ sort: e.target.value, page: 1 });
                  }
                }}
                // Support direct action on change via JS in case window is ready
                id="sort-select"
              >
                <option value="newest">Newest</option>
                <option value="views">Most Viewed</option>
                <option value="likes">Most Liked</option>
                <option value="popular">Popularity</option>
              </select>
              {/* Inline JS fallback for SSR onChange direct redirect */}
              <script dangerouslySetInnerHTML={{__html: `
                document.getElementById('sort-select').addEventListener('change', function(e) {
                  const urlParams = new URLSearchParams(window.location.search);
                  urlParams.set('sort', e.target.value);
                  urlParams.set('page', '1');
                  window.location.href = '/projects?' + urlParams.toString();
                });
              `}} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-gray-850 pb-5">
        {categories.map((cat) => {
          const isActive = category === cat || (cat === "All" && !category);
          return (
            <Link
              key={cat}
              href={getQueryUrl({ category: cat, page: 1 })}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {cat}
            </Link>
          );
        })}
      </div>

      {/* Filter Active States Info */}
      {(query || category || tech) && (
        <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
          <span>Active filters:</span>
          {query && (
            <span className="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium">
              Search: "{query}"
              <Link href={getQueryUrl({ query: null, page: 1 })} className="text-gray-400 hover:text-gray-600 font-bold">×</Link>
            </span>
          )}
          {category && (
            <span className="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium">
              Category: {category}
              <Link href={getQueryUrl({ category: null, page: 1 })} className="text-gray-400 hover:text-gray-600 font-bold">×</Link>
            </span>
          )}
          {tech && (
            <span className="bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium">
              Technology: {tech}
              <Link href={getQueryUrl({ tech: null, page: 1 })} className="text-gray-400 hover:text-gray-600 font-bold">×</Link>
            </span>
          )}
          <Link href="/projects" className="text-blue-500 font-semibold hover:underline ml-2">Clear all</Link>
        </div>
      )}

      {/* Project Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <ProjectCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <div className="max-w-md mx-auto space-y-3">
            <h3 className="text-xl font-bold text-gray-950 dark:text-white">
              No projects found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-450 leading-relaxed">
              We couldn't find any projects matching your search. Try resetting the filters or searching for something else.
            </p>
            <div className="pt-2">
              <Link href="/projects">
                <Button variant="outline" className="text-xs font-bold">
                  Reset Search & Filters
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-850 pt-6">
          <span className="text-xs font-semibold text-gray-500">
            Page {pageNum} of {totalPages} ({totalProjects} total projects)
          </span>

          <div className="flex items-center gap-2">
            {pageNum > 1 ? (
              <Link href={getQueryUrl({ page: pageNum - 1 })}>
                <Button variant="outline" size="sm" className="flex items-center font-bold text-xs gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="flex items-center font-bold text-xs gap-1.5 opacity-50">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </Button>
            )}

            {pageNum < totalPages ? (
              <Link href={getQueryUrl({ page: pageNum + 1 })}>
                <Button variant="outline" size="sm" className="flex items-center font-bold text-xs gap-1.5">
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled className="flex items-center font-bold text-xs gap-1.5 opacity-50">
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
