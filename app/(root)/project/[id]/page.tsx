import { Boxes } from '@/components/ui/background-boxes'
import { dbConnect } from '@/lib/mongodb'
import Project from '@/lib/models/Project'
import Playlist from '@/lib/models/Playlist'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { isValidObjectId } from 'mongoose'
import markdownit from "markdown-it";
import { formateDate } from '@/lib/utils'
import Views from "@/components/Views";
import { ProjectTypeCard } from '@/components/ProjectCard'
import { ThreeDCardDemo } from '@/components/ThreeDCard'
import LikeButton from '@/components/LikeButton'
import { auth } from '@/auth'
import { SafeImage } from '@/components/ui/safe-image'

const md = markdownit();
export const experimental_ppr = true
const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  await dbConnect();

  // Allow routes by ObjectId or slug
  const projectQuery = isValidObjectId(id)
    ? Project.findById(id)
    : Project.findOne({ slug: id });

  const [doc, editor] = await Promise.all([
    projectQuery.populate('author', '_id name username image email instagram').lean(),
    Playlist.findOne({ slug: 'editor-picks' }).populate({ path: 'select', options: { sort: { _createdAt: -1 } }, populate: { path: 'author', select: '_id name username image bio' } }).lean(),
  ]);

  // Guard against null and incorrect array type from mongoose typings
  if (!doc || Array.isArray(doc)) return notFound();

  const post: any = {
    _id: String(doc._id),
    _createdAt: doc._createdAt?.toISOString?.() || new Date().toISOString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    category: doc.category,
    image: doc.image,
    details: doc.details,
    author: doc.author && {
      _id: String(doc.author._id),
      name: doc.author.name,
      username: doc.author.username,
      image: doc.author.image,
      email: doc.author.email,
      instagram: doc.author.instagram,
    },
    likes: Array.isArray(doc.likes) ? doc.likes.map((x: any) => ({ _id: String(x) })) : []
  };

  // Narrow Playlist result which can be incorrectly inferred as array by Mongoose typings
  const editorDoc = editor && !Array.isArray(editor) ? editor : null;

  const editorPost = editorDoc?.select?.map((d: any) => ({
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
      bio: d.author.bio,
    },
  })) || [];

  const parsedContent = md.render(post?.details || "");

  const likes = post.likes || [];
  const likedByMe = !!likes.find((l: any) => l._id === session?.id);

  return (
    <>
      <div className="h-auto md:h-96 relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg p-4 md:p-8">
        <div className="absolute inset-0 w-full h-full z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
        <Boxes />
        <p className="tag relative text-xs md:text-sm">{formateDate(post?._createdAt)}</p>
        <h1 className="heading relative text-2xl md:text-4xl text-center">{post.title}</h1>
        <p className="sub-heading !max-w-5xl relative line-clamp-3 text-sm md:text-base text-center px-2 md:px-0">
          {post.description}
        </p>
      </div>

      <section className="section_container px-4 md:px-0">
        <SafeImage
          src={post.image}
          alt={post.title || 'Project image'}
          width={800}
          height={500}
          className="w-full h-auto rounded-xl object-cover max-h-[500px]"
          fallbackSrc="https://placehold.co/800x500/e2e8f0/64748b?text=Project+Image"
        />

        <div className="space-y-8 mt-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            {/* Author Info */}
            <div className="flex gap-4 items-start flex-wrap">
              <SafeImage
                src={post.author.image}
                alt={post.author.name || 'Author'}
                width={64}
                height={64}
                className="rounded-full drop-shadow-lg"
                fallbackSrc="/logo.png"
                unoptimized
              />
              <div>
                <div className="text-base font-semibold">{post.author.name}</div>
                <Link
                  href={`/user/${post.author._id}`}
                  className="text-sm text-blue-500 cursor-pointer"
                >
                  @{post.author.username}
                </Link>
                {(post.author.email || post.author.instagram) && (
                  <div className="mt-1 text-xs text-gray-500 flex gap-2 flex-wrap">
                    {post.author.email && (
                      <a
                        href={`mailto:${post.author.email}`}
                        className="underline"
                      >
                        Email
                      </a>
                    )}
                    {post.author.instagram && (
                      <a
                        href={`https://instagram.com/${post.author.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Category + Like */}
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <p className="category-tag text-xs md:text-sm">
                {post.category}
              </p>
              <LikeButton
                projectId={post._id}
                initialLiked={likedByMe}
                initialCount={likes.length}
              />
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">PROJECT DETAILS</h3>
            {parsedContent ? (
              <article
                className="prose max-w-4xl font-work-sans break-words text-sm md:text-base"
                dangerouslySetInnerHTML={{ __html: parsedContent }}
              />
            ) : (
              <p className="no-result">No Details Provided</p>
            )}
          </div>

          <hr className="divider" />

          {/* Editor Picks */}
          {editorPost?.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl font-semibold">Editor Picks</p>
              <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {editorPost.map((post: ProjectTypeCard) => (
                  <ThreeDCardDemo key={post._id} post={post} />
                ))}
              </ul>
            </div>
          )}

          {/* Views */}
          <Suspense fallback={<></>}>
            <Views id={id} />
          </Suspense>
        </div>
      </section>
    </>

  )
}

export default page