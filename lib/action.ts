"use server";
import { auth } from "@/auth";
import { parseServerActionResponse } from "./utils";
import slugify from "slugify";
import { dbConnect } from "@/lib/mongodb";
import Project from "@/lib/models/Project";
import Feedback from "@/lib/models/Feedback";
import { formSchema } from "./validation";
import { revalidatePath } from "next/cache";

export const createProject = async (
  state: any,
  form: FormData,
  details: string
) => {
  const session = await auth();
  if (!session?.id)
    return parseServerActionResponse({
      error: "Unauthorized",
      status: "Error",
    });

  const rawValues = {
    title: form.get("title") as string,
    description: form.get("description") as string,
    category: form.get("category") as string,
    link: form.get("link") as string,
    githubUrl: form.get("githubUrl") as string,
    liveUrl: form.get("liveUrl") as string || "",
    documentationUrl: form.get("documentationUrl") as string || "",
    technologies: form.get("technologies") as string || "",
    screenshots: form.get("screenshots") ? JSON.parse(form.get("screenshots") as string) : [],
    status: form.get("status") as string || "Published",
    details
  };

  try {
    await dbConnect();
    const slug = slugify(rawValues.title, { lower: true, strict: true });
    
    // Ensure slug uniqueness
    let uniqueSlug = slug;
    let counter = 1;
    while (await Project.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const doc = await Project.create({
      title: rawValues.title,
      description: rawValues.description,
      category: rawValues.category,
      image: rawValues.link,
      coverImage: rawValues.link,
      slug: uniqueSlug,
      author: session.id,
      creator: session.id,
      details,
      githubUrl: rawValues.githubUrl,
      liveUrl: rawValues.liveUrl,
      documentationUrl: rawValues.documentationUrl,
      technologies: rawValues.technologies.split(",").map(t => t.trim()).filter(Boolean),
      screenshots: rawValues.screenshots,
      status: rawValues.status,
    });

    revalidatePath("/projects");
    revalidatePath("/");

    return parseServerActionResponse({
      _id: String(doc._id),
      slug: doc.slug,
      error: "",
      status: "Success",
    });
  } catch (error: any) {
    console.error("Create project error:", error);
    return parseServerActionResponse({
      error: error.message || JSON.stringify(error),
      status: "Error",
    });
  }
};

export const updateProject = async (
  projectId: string,
  state: any,
  form: FormData,
  details: string
) => {
  const session = await auth();
  if (!session?.id)
    return parseServerActionResponse({
      error: "Unauthorized",
      status: "Error",
    });

  await dbConnect();
  const existingProject = await Project.findById(projectId).lean();
  if (!existingProject || Array.isArray(existingProject)) {
    return parseServerActionResponse({
      error: "Project not found",
      status: "Error",
    });
  }

  // Only the project owner can edit
  if (String(existingProject.author) !== session.id) {
    return parseServerActionResponse({
      error: "Unauthorized - Forbidden",
      status: "Error",
    });
  }

  const rawValues = {
    title: form.get("title") as string,
    description: form.get("description") as string,
    category: form.get("category") as string,
    link: form.get("link") as string,
    githubUrl: form.get("githubUrl") as string,
    liveUrl: form.get("liveUrl") as string || "",
    documentationUrl: form.get("documentationUrl") as string || "",
    technologies: form.get("technologies") as string || "",
    screenshots: form.get("screenshots") ? JSON.parse(form.get("screenshots") as string) : [],
    status: form.get("status") as string || "Published",
    details
  };

  try {
    const slug = slugify(rawValues.title, { lower: true, strict: true });
    
    // Check if slug is unique if title changed
    let uniqueSlug = existingProject.slug;
    if (existingProject.title !== rawValues.title) {
      uniqueSlug = slug;
      let counter = 1;
      while (await Project.findOne({ slug: uniqueSlug, _id: { $ne: projectId } })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }
    }

    const updated = await Project.findByIdAndUpdate(
      projectId,
      {
        title: rawValues.title,
        description: rawValues.description,
        category: rawValues.category,
        image: rawValues.link,
        coverImage: rawValues.link,
        slug: uniqueSlug,
        details,
        githubUrl: rawValues.githubUrl,
        liveUrl: rawValues.liveUrl,
        documentationUrl: rawValues.documentationUrl,
        technologies: rawValues.technologies.split(",").map(t => t.trim()).filter(Boolean),
        screenshots: rawValues.screenshots,
        status: rawValues.status,
      },
      { new: true }
    );

    revalidatePath("/projects");
    revalidatePath(`/projects/${uniqueSlug}`);
    revalidatePath(`/project/${projectId}`);
    revalidatePath("/");

    return parseServerActionResponse({
      _id: String(updated._id),
      slug: updated.slug,
      error: "",
      status: "Success",
    });
  } catch (error: any) {
    console.error("Update project error:", error);
    return parseServerActionResponse({
      error: error.message || JSON.stringify(error),
      status: "Error",
    });
  }
};

export const deleteProject = async (projectId: string) => {
  const session = await auth();
  if (!session?.id) {
    return { error: "Unauthorized", status: "Error" };
  }

  try {
    await dbConnect();
    const existingProject = await Project.findById(projectId).lean();
    if (!existingProject || Array.isArray(existingProject)) {
      return { error: "Project not found", status: "Error" };
    }

    if (String(existingProject.author) !== session.id) {
      return { error: "Forbidden", status: "Error" };
    }

    await Project.findByIdAndDelete(projectId);
    await Feedback.deleteMany({ project: projectId });

    revalidatePath("/projects");
    revalidatePath("/");
    revalidatePath("/dashboard");

    return { status: "Success" };
  } catch (error: any) {
    console.error("Delete project error:", error);
    return { error: error.message || "Failed to delete project", status: "Error" };
  }
};
