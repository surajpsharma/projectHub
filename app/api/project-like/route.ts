import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Project from "@/lib/models/Project";

// Toggle like by current user on a project
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { projectId } = await req.json();
    if (!projectId)
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );

    await dbConnect();
    // Add user id to likes if not exists
    await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { likes: session.id } },
      { new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to like" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { projectId } = await req.json();
    if (!projectId)
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );

    await dbConnect();
    await Project.findByIdAndUpdate(projectId, {
      $pull: { likes: session.id },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to unlike" }, { status: 500 });
  }
}
