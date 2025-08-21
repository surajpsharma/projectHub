import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Feedback from "@/lib/models/Feedback";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // Basic validation
    const name = String(body.name || "").trim();
    const message = String(body.message || "").trim();
    const email =
      typeof body.email === "string" ? body.email.trim() : undefined;
    const rating = body.rating != null ? Number(body.rating) : undefined;

    if (!name || !message) {
      return NextResponse.json(
        { error: "Name and message are required." },
        { status: 400 }
      );
    }

    if (rating != null && (Number.isNaN(rating) || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const feedback = await Feedback.create({ name, email, message, rating });
    return NextResponse.json(
      { ok: true, feedbackId: feedback._id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Feedback POST error:", err);
    return NextResponse.json(
      { error: "Failed to submit feedback." },
      { status: 500 }
    );
  }
}
