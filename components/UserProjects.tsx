import React from 'react'
import { ProjectTypeCard } from './ProjectCard';
import { ThreeDCardDemo } from './ThreeDCard';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';

const UserProjects = async ({ id }: { id: string }) => {
  await dbConnect();
  const docs = await Project.find({ author: id })
    .populate('author', '_id name username image')
    .sort({ _createdAt: -1 })
    .lean();

  const project: ProjectTypeCard[] = docs.map((d: any) => ({
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
    },
  }));

  return (
    <>
      {project?.length > 0 ? (
        project.map((post: ProjectTypeCard) => (
          <div key={post._id} className="w-full">
            <ThreeDCardDemo post={post} />
          </div>
        ))
      ) : null}
    </>
  )
}

export default UserProjects