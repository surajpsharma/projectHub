"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Feedback from "@/lib/models/Feedback";
import Project from "@/lib/models/Project";
import { revalidatePath } from "next/cache";

export async function createFeedback(projectId: string, message: string, rating?: number) {
  const session = await auth();
  if (!session?.id) {
    return { status: "Error", error: "You must be signed in to leave feedback." };
  }

  const cleanMessage = String(message || "").trim();
  if (!cleanMessage) {
    return { status: "Error", error: "Message is required." };
  }

  if (cleanMessage.length < 5) {
    return { status: "Error", error: "Message must be at least 5 characters long." };
  }

  try {
    await dbConnect();

    const feedback = await Feedback.create({
      name: session.user?.name || "Anonymous",
      email: session.user?.email || "",
      message: cleanMessage,
      rating: rating || undefined,
      user: session.id,
      project: projectId,
    });

    const project = await Project.findById(projectId).select('slug').lean();
    if (project && !Array.isArray(project) && (project as any).slug) {
      revalidatePath(`/projects/${(project as any).slug}`);
      revalidatePath(`/project/${projectId}`); // revalidate fallback route too
    }

    return { status: "Success", feedbackId: String(feedback._id) };
  } catch (err: any) {
    console.error("Create feedback error:", err);
    return { status: "Error", error: err.message || "Failed to submit feedback" };
  }
}

export async function deleteFeedback(feedbackId: string) {
  const session = await auth();
  if (!session?.id) {
    return { status: "Error", error: "You must be signed in to delete feedback." };
  }

  try {
    await dbConnect();
    const feedback = await Feedback.findById(feedbackId).populate('project').lean();
    if (!feedback || Array.isArray(feedback)) {
      return { status: "Error", error: "Feedback not found." };
    }

    const isCreatorOfFeedback = String(feedback.user) === session.id;
    
    // Check if the current user is the owner of the project associated with the feedback
    const projectOwnerId = feedback.project && (feedback.project as any).author;
    const isProjectOwner = String(projectOwnerId) === session.id;

    if (!isCreatorOfFeedback && !isProjectOwner) {
      return { status: "Error", error: "Unauthorized to delete this feedback." };
    }

    await Feedback.findByIdAndDelete(feedbackId);

    if (feedback.project && (feedback.project as any).slug) {
      revalidatePath(`/projects/${(feedback.project as any).slug}`);
      revalidatePath(`/project/${String((feedback.project as any)._id)}`);
    }

    return { status: "Success" };
  } catch (err: any) {
    console.error("Delete feedback error:", err);
    return { status: "Error", error: err.message || "Failed to delete feedback" };
  }
}
