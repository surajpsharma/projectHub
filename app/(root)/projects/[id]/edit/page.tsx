import { auth } from '@/auth';
import { notFound, redirect } from 'next/navigation';
import React from 'react';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import EditProjectForm from '@/components/projects/EditProjectForm';
import { isValidObjectId } from 'mongoose';

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  if (!isValidObjectId(id)) {
    return notFound();
  }

  await dbConnect();
  const doc = await Project.findById(id).lean();
  if (!doc || Array.isArray(doc)) {
    return notFound();
  }

  // Verify ownership
  if (String(doc.author) !== session.id) {
    redirect(`/projects/${doc.slug || id}`);
  }

  const project: any = {
    _id: String(doc._id),
    title: doc.title,
    description: doc.description,
    category: doc.category,
    image: doc.image || doc.coverImage,
    coverImage: doc.coverImage || doc.image,
    details: doc.details || "",
    githubUrl: doc.githubUrl || "",
    liveUrl: doc.liveUrl || "",
    documentationUrl: doc.documentationUrl || "",
    technologies: doc.technologies || [],
    screenshots: doc.screenshots || [],
    status: doc.status || "Published",
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-10 px-6">
      <div className="max-w-4xl mx-auto">
        <EditProjectForm project={project} />
      </div>
    </div>
  );
}
