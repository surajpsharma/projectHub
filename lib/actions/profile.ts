"use server";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongodb";
import Author from "@/lib/models/Author";
import { profileSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function updateProfile(state: any, formData: FormData) {
  const session = await auth();
  if (!session?.id) {
    return { status: "Error", error: "You must be signed in to modify settings." };
  }

  const rawValues = {
    name: formData.get("name") as string,
    username: formData.get("username") as string,
    email: formData.get("email") as string || "",
    bio: formData.get("bio") as string || "",
    instagram: formData.get("instagram") as string || "",
    github: formData.get("github") as string || "",
    portfolio: formData.get("portfolio") as string || "",
    twitter: formData.get("twitter") as string || "",
    linkedin: formData.get("linkedin") as string || "",
    image: formData.get("image") as string || "",
  };

  try {
    // Validate inputs
    await profileSchema.parseAsync(rawValues);

    await dbConnect();
    
    // Check if username is taken by another user (case-insensitive check)
    const existingUsername = await Author.findOne({
      username: { $regex: new RegExp(`^${rawValues.username}$`, 'i') },
      _id: { $ne: session.id }
    }).lean();

    if (existingUsername) {
      return { status: "Error", error: "Username is already taken by another user." };
    }

    const updated = await Author.findByIdAndUpdate(
      session.id,
      {
        name: rawValues.name,
        username: rawValues.username.toLowerCase().replace(/\s+/g, ""),
        email: rawValues.email || undefined,
        bio: rawValues.bio,
        instagram: rawValues.instagram,
        github: rawValues.github,
        portfolio: rawValues.portfolio,
        twitter: rawValues.twitter,
        linkedin: rawValues.linkedin,
        image: rawValues.image || undefined,
      },
      { new: true }
    );

    revalidatePath("/creators");
    revalidatePath(`/creators/${updated.username}`);
    revalidatePath("/dashboard");
    revalidatePath("/");

    return { status: "Success", username: updated.username };
  } catch (error: any) {
    console.error("Update profile error:", error);
    return { status: "Error", error: error.message || "Failed to update profile settings." };
  }
}
