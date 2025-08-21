import { auth } from '@/auth';
import { ThreeDCardDemo } from '@/components/ThreeDCard';
import { EvervaultCard, Icon } from '@/components/ui/evervault-card';
import UserProjects from '@/components/UserProjects';
import { dbConnect } from '@/lib/mongodb';
import Author from '@/lib/models/Author';
import Project from '@/lib/models/Project';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import type { AuthorDoc } from '@/lib/models/Author'
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Eye, FolderOpen, Mail } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import Link from 'next/link';

const page = async ({ params }: { params: { id: string } }) => {

  const id = (await params).id;
  const session = await auth();

  await dbConnect();
  // Type the lean() result to avoid union with array type and make _id accessible
  const userDoc = await Author.findById(id).lean<AuthorDoc | null>();
  const userProjectsDocs = await Project.find({ author: id }).select('views').lean<Array<{ views?: number }>>();

  const user = userDoc && {
    _id: String((userDoc as unknown as { _id: string })._id),
    _createdAt: (userDoc as any)._createdAt?.toISOString?.() || new Date().toISOString(),
    name: userDoc.name,
    username: userDoc.username,
    image: userDoc.image,
    email: userDoc.email,
    instagram: userDoc.instagram,
    bio: userDoc.bio,
  };

  const userProjects = userProjectsDocs?.map(d => ({ views: d.views || 0 })) || [];

  if (!user) return notFound();

  // Calculate user stats
  const totalProjects = userProjects?.length || 0;
  const totalViews = userProjects?.reduce((sum: number, project: any) => sum + (project.views || 0), 0) || 0;
  const joinDate = new Date(user._createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  return (
    <>
      <section className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        {/* Hero Section with Enhanced Profile Card */}
        <div className='relative overflow-hidden'>
          {/* Background Pattern */}
          <div className='absolute inset-0 bg-grid-pattern opacity-5'></div>

          <div className='relative max-w-7xl mx-auto px-6 pt-20 pb-16'>
            {/* Profile Header */}
            <div className='flex flex-col lg:flex-row gap-12 items-start'>

              {/* Enhanced Profile Card */}
              <div className='lg:w-1/3'>
                <Card className='relative overflow-hidden border-2 border-black/10 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
                  <CardContent className='p-0'>
                    {/* Profile Image Section */}
                    <div className='relative h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500'>
                      <div className='absolute inset-0 bg-black/20'></div>
                      <div className='absolute -bottom-16 left-1/2 transform -translate-x-1/2'>
                        <div className='relative'>
                          <div className='w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-white'>
                            <SafeImage
                              src={user.image}
                              alt={user.name || 'User'}
                              width={128}
                              height={128}
                              className='w-full h-full object-cover'
                              fallbackSrc='/logo.png'
                              unoptimized
                            />
                          </div>
                          {session?.id === id && (
                            <div className='absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center'>
                              <div className='w-3 h-3 bg-white rounded-full'></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className='pt-20 pb-8 px-8 text-center'>
                      <h1 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                        {user.name}
                      </h1>
                      <p className='text-lg text-blue-600 dark:text-blue-400 font-medium mb-4'>
                        @{user.username}
                      </p>

                      {user.bio && (
                        <p className='text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-sm mx-auto'>
                          {user.bio}
                        </p>
                      )}

                      {/* Contact Info */}
                      {(user.email || user.instagram) && (
                        <div className='flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400 mb-6'>
                          {user.email && (
                            <a href={`mailto:${user.email}`} className='text-sm underline flex items-center gap-2'>
                              <Mail className='w-4 h-4' />
                              {user.email}
                            </a>
                          )}
                          {user.instagram && (
                            <a href={`https://instagram.com/${user.instagram}`} target='_blank' className='text-sm underline'>
                              @{user.instagram}
                            </a>
                          )}
                        </div>
                      )}

                      {/* Stats Grid */}
                      <div className='grid grid-cols-3 gap-4 mb-6'>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                            {totalProjects}
                          </div>
                          <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                            Projects
                          </div>
                        </div>
                        <div className='text-center border-x border-gray-200 dark:border-gray-700'>
                          <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                            {totalViews.toLocaleString()}
                          </div>
                          <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                            Views
                          </div>
                        </div>
                        <div className='text-center'>
                          <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                            {joinDate.split(' ')[1]}
                          </div>
                          <div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide'>
                            Joined
                          </div>
                        </div>
                      </div>

                      {/* Join Date */}
                      <div className='flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                        <CalendarDays className='w-4 h-4' />
                        <span>Member since {joinDate}</span>
                      </div>

                      {session?.id === id && (
                        <div className='mt-6'>
                          <Link href={`/user/${id}/edit`}>
                            <Button variant="outline">Edit Profile</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Projects Section */}
              <div className='lg:w-2/3 flex-1'>
                <div className='mb-8'>
                  <div className='flex items-center justify-between mb-6'>
                    <div>
                      <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
                        {session?.id === id ? "Your Projects" : `${user.name}'s Projects`}
                      </h2>
                      <p className='text-gray-600 dark:text-gray-400'>
                        {totalProjects === 0
                          ? "No projects yet"
                          : `${totalProjects} project${totalProjects !== 1 ? 's' : ''} • ${totalViews.toLocaleString()} total views`
                        }
                      </p>
                    </div>

                    {totalProjects > 0 && (
                      <Badge variant="secondary" className='flex items-center gap-2'>
                        <FolderOpen className='w-4 h-4' />
                        {totalProjects} Projects
                      </Badge>
                    )}
                  </div>

                  {/* Projects Grid */}
                  {totalProjects > 0 ? (
                    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                      <Suspense fallback={
                        <div className='col-span-full'>
                          <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className='animate-pulse'>
                                <div className='bg-gray-200 dark:bg-gray-700 rounded-xl h-80'></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      }>
                        <UserProjects id={id} />
                      </Suspense>
                    </div>
                  ) : (
                    <Card className='border-2 border-dashed border-gray-300 dark:border-gray-600'>
                      <CardContent className='flex flex-col items-center justify-center py-16 text-center'>
                        <div className='w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4'>
                          <FolderOpen className='w-8 h-8 text-gray-400' />
                        </div>
                        <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
                          {session?.id === id ? "No projects yet" : "No projects found"}
                        </h3>
                        <p className='text-gray-500 dark:text-gray-400 max-w-sm'>
                          {session?.id === id
                            ? "Start building something amazing! Your projects will appear here once you create them."
                            : `${user.name} hasn't shared any projects yet.`
                          }
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default page