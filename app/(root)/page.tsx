import { auth } from '@/auth';
import ProjectCard, { ProjectTypeCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame, Clock, Sparkles, Terminal, Shield, Eye, Heart, Code, User, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Author from '@/lib/models/Author';
import { SafeImage } from '@/components/ui/safe-image';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await auth();

  await dbConnect();

  // 1. Fetch Featured Projects (Top views + likes count)
  const featuredDocs = await Project.aggregate([
    { $match: { status: { $ne: "Draft" } } },
    { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
    { $sort: { views: -1, likesCount: -1 } },
    { $limit: 3 }
  ]);
  const populatedFeatured = await Project.populate(featuredDocs, {
    path: 'author',
    select: '_id name username image email bio'
  });

  // 2. Fetch Trending Projects (Sorted by likes size)
  const trendingDocs = await Project.aggregate([
    { $match: { status: { $ne: "Draft" } } },
    { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
    { $sort: { likesCount: -1, views: -1 } },
    { $limit: 6 }
  ]);
  const populatedTrending = await Project.populate(trendingDocs, {
    path: 'author',
    select: '_id name username image email bio'
  });

  // 3. Fetch Recently Added
  const recentDocs = await Project.find({ status: { $ne: "Draft" } })
    .sort({ _createdAt: -1 })
    .limit(6)
    .populate('author', '_id name username image email bio')
    .lean();

  // Helper mapper to component contract
  const mapDocToCard = (d: any): ProjectTypeCard => ({
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
  });

  const featuredPosts = populatedFeatured.map(mapDocToCard);
  const trendingPosts = populatedTrending.map(mapDocToCard);
  const recentPosts = recentDocs.map(mapDocToCard);

  // 4. Fetch Top Creators and aggregate project counts
  const topCreatorsRaw = await Author.find().limit(5).lean();
  const topCreators = await Promise.all(topCreatorsRaw.map(async (c: any) => {
    const projectCount = await Project.countDocuments({ author: c._id, status: { $ne: "Draft" } });
    return {
      _id: String(c._id),
      name: c.name,
      username: c.username,
      image: c.image,
      bio: c.bio,
      projectCount
    };
  }));
  // Sort creators by project count
  topCreators.sort((a, b) => b.projectCount - a.projectCount);

  // 5. Popular Technologies static list for UI routing
  const popularTech = [
    { name: "React", slug: "react", count: 12, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    { name: "Next.js", slug: "nextjs", count: 8, color: "bg-black/10 text-black dark:text-white dark:bg-white/10 border-black/10 dark:border-white/10" },
    { name: "TypeScript", slug: "typescript", count: 15, color: "bg-blue-600/10 text-blue-700 dark:text-blue-400 border-blue-600/20" },
    { name: "Tailwind CSS", slug: "tailwind-css", count: 18, color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20" },
    { name: "Node.js", slug: "nodejs", count: 9, color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
    { name: "MongoDB", slug: "mongodb", count: 7, color: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-405 border-emerald-600/20" },
    { name: "Python", slug: "python", count: 6, color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
    { name: "Rust", slug: "rust", count: 3, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-gray-100 dark:border-gray-900 bg-gradient-to-b from-gray-50/50 via-white to-white dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100/50 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider animate-float">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Showcase your developer journey</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1] max-w-4xl mx-auto">
            Discover. Build. <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Share.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            ProjectHub is where developers showcase projects, discover new ideas, and connect through what they build.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/projects">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/20 rounded-xl transition-all duration-200">
                Explore Projects
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <Link href={session ? "/projects/create" : "/projects"}>
              <Button size="lg" variant="outline" className="px-8 py-6 text-base font-semibold border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 rounded-xl transition-all duration-200">
                Share Your Project
              </Button>
            </Link>
          </div>

          {/* Interactive Search Box */}
          <div className="max-w-2xl mx-auto pt-6">
            <form action="/projects" method="GET" className="relative flex items-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-200">
              <Code className="w-5 h-5 text-gray-400 absolute left-4" />
              <input
                type="text"
                name="query"
                placeholder="Search projects, categories, or tech stack (e.g. Next.js, AI)..."
                className="w-full pl-12 pr-28 py-4 bg-transparent outline-none text-gray-900 dark:text-white text-base rounded-2xl placeholder-gray-400 dark:placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 hover:opacity-90 rounded-lg text-xs font-bold transition-opacity"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Projects Carousel-like Static Grid */}
      {featuredPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 dark:border-gray-850 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Handpicked Showcase</span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Featured Projects
              </h2>
            </div>
            <Link href="/projects" className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
              <span>View all projects</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <div key={post._id} className="h-full">
                <ProjectCard post={post} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Trending & Recent Split Grid */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Trending Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">
                <Flame className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Trending Projects
              </h2>
            </div>
          </div>

          {trendingPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {trendingPosts.map((post) => (
                <ProjectCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No trending projects found.</p>
          )}
        </div>

        {/* Recently Added Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-green-500/10 text-green-500 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Recently Added
              </h2>
            </div>
          </div>

          {recentPosts.length > 0 ? (
            <div className="space-y-6">
              {recentPosts.map((post) => (
                <div key={post._id} className="flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-850 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-800 transition-all">
                  <div className="w-20 h-14 relative rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    <SafeImage
                      src={post.coverImage || post.image || ''}
                      alt={post.title}
                      width={80}
                      height={56}
                      className="w-full h-full object-cover"
                      fallbackSrc="https://placehold.co/80x56/e2e8f0/64748b?text=Proj"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/projects/${post.slug || post._id}`} className="block text-sm font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate">
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                      <span className="font-semibold text-gray-500">@{post.author?.username}</span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5 text-rose-500" /> {post.likes?.length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No recently added projects.</p>
          )}
        </div>
      </section>

      {/* Popular Technologies Section */}
      <section className="bg-gray-50/50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-850 py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Explore by Technology
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Find developers building with your favorite languages, frameworks, and databases.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularTech.map((tech) => (
              <Link
                key={tech.slug}
                href={`/technologies/${tech.slug}`}
                className="group p-5 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 hover:border-blue-500/30 dark:hover:border-blue-500/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tech.name}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  Browse projects
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link href="/technologies" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
              View all technologies ({popularTech.length}+)
            </Link>
          </div>
        </div>
      </section>

      {/* Top Creators Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Top Creators
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Meet the talented developers, designers, and students shipping projects on ProjectHub.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {topCreators.map((creator) => (
            <div
              key={creator._id}
              className="flex flex-col items-center p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-center hover:shadow-md transition-all"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-50 border border-gray-100 dark:border-gray-800 mb-4">
                <SafeImage
                  src={creator.image || ''}
                  alt={creator.name || 'Creator'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  fallbackSrc="/logo.png"
                  unoptimized
                />
              </div>
              <Link href={`/creators/${creator.username}`} className="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {creator.name || creator.username}
              </Link>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                @{creator.username}
              </span>
              <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mt-3 leading-relaxed">
                {creator.bio || "Full-stack developer shipping ideas"}
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-850 w-full text-xs text-gray-500">
                <span className="font-bold text-gray-700 dark:text-gray-300">{creator.projectCount}</span> {creator.projectCount === 1 ? 'project' : 'projects'}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Link href="/creators" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Discover all creators
          </Link>
        </div>
      </section>

      {/* How ProjectHub Works */}
      <section className="bg-gray-50/50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-850 py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              How ProjectHub Works
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get your work noticed by the global developer community in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Profile", desc: "Connect your GitHub or Google account and set up your portfolio links." },
              { step: "02", title: "Submit Project", desc: "Fill in links, screenshots, details, and tag the technologies you used." },
              { step: "03", title: "Collect Feedback", desc: "Gain upvotes, views, and read structured constructive reviews from others." },
              { step: "04", title: "Build Network", desc: "Find other creators, share ideas, and kickstart collaborate projects." }
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl space-y-4">
                <span className="text-4xl font-extrabold text-blue-500/20 dark:text-blue-400/10 absolute top-4 right-4">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white pt-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-6 text-center">
        <div className="p-8 md:p-16 rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight relative z-10">
            Ready to share what you've built?
          </h2>
          <p className="text-blue-100 max-w-xl mx-auto text-sm md:text-base relative z-10 leading-relaxed">
            Join thousands of developers showcase their projects, receive feedback, and find their next co-creators.
          </p>
          <div className="pt-4 relative z-10">
            <Link href={session ? "/projects/create" : "/projects"}>
              <Button size="lg" className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-6 rounded-xl font-bold transition-colors">
                Publish Your Project Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
