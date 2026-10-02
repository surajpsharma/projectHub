import { dbConnect } from "@/lib/mongodb";
import Project from "@/lib/models/Project";
import { notFound, redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";

export const dynamic = 'force-dynamic';

export default async function ProjectIdRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();

  const query = isValidObjectId(id)
    ? Project.findById(id)
    : Project.findOne({ slug: id });

  const project = await query.select("slug").lean();
  if (!project || Array.isArray(project)) return notFound();

  // Permanent or normal redirect to the SEO-friendly URL
  redirect(`/projects/${project.slug}`);
}