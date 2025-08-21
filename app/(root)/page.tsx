import { auth } from '@/auth';
import { ProjectTypeCard } from '@/components/ProjectCard';
import SearchForm from '@/components/SearchForm';
import { ThreeDCardDemo } from '@/components/ThreeDCard';
import { Boxes } from '@/components/ui/background-boxes';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, Users, Eye } from 'lucide-react';
import Link from 'next/link';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';

export default async function Home({ searchParams }: {
  searchParams: Promise<{ query?: string }>
}) {
  const query = (await searchParams).query;
  const session = await auth();

  await dbConnect();
  const q: any = {};
  if (query) {
    const regex = new RegExp(query, 'i');
    q.$or = [
      { title: regex },
      { category: regex },
      { description: regex },
    ];
  }
  const docs = await Project.find(q)
    .populate('author', '_id name username image email instagram bio')
    .sort({ views: -1 })
    .lean();

  const posts: ProjectTypeCard[] = docs.map((d: any) => ({
    _id: String(d._id),
    _createdAt: d._createdAt?.toISOString?.() || new Date().toISOString(),
    title: d.title,
    slug: d.slug,
    description: d.description,
    category: d.category,
    image: d.image,
    views: d.views || 0,
    author: d.author && {
      _id: String(d.author._id),
      name: d.author.name,
      username: d.author.username,
      image: d.author.image,
      email: d.author.email,
      instagram: d.author.instagram,
      bio: d.author.bio,
    },
    likes: Array.isArray(d.likes) ? d.likes.map((id: any) => ({ _id: String(id) })) : [],
  }));

  const totalProjects = posts?.length || 0;

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-blue-600">ProjectHub</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Where <span className="text-blue-600 font-semibold">brilliant minds</span> meet,
            <span className="text-purple-600 font-semibold"> ideas flourish</span>, and
            <span className="text-green-600 font-semibold"> dreams become reality</span>.
          </p>
          <div className="max-w-2xl mx-auto mb-8">
            <SearchForm query={query} />
          </div>
          {session?.user ? (
            <Link href="/project/create">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                <Lightbulb className="w-5 h-5 mr-2" />
                Create Your Ideas Into Project
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              <Users className="w-5 h-5 mr-2" />
              Join ProjectHub
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {query ? `Search Results for "${query}"` : 'Featured Projects'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {query
                ? `Found ${totalProjects} project${totalProjects !== 1 ? 's' : ''}`
                : 'Discover innovative projects from our community'
              }
            </p>
          </div>

          {posts?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: ProjectTypeCard) => (
                <div key={post._id}>
                  <ThreeDCardDemo post={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                {query ? (
                  <Eye className="w-8 h-8 text-gray-400" />
                ) : (
                  <Lightbulb className="w-8 h-8 text-gray-400" />
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {query ? 'No projects found' : 'No projects yet'}
              </h3>

              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {query
                  ? `No projects match "${query}". Try different search terms.`
                  : 'Be the first to share your project with the community!'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {query && (
                  <Link href="/">
                    <Button variant="outline">View All Projects</Button>
                  </Link>
                )}

                {session?.user && (
                  <Link href="/project/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
