"use server";
import { auth } from "@/auth";
import { parseServerActionResponse } from "./utils";
import slugify from "slugify";
import { dbConnect } from "@/lib/mongodb";
import Project from "@/lib/models/Project";
import Author from "@/lib/models/Author";
export const createProject = async (
  state: any,
  form: FormData,
  details: string
) => {
  const session = await auth();
  if (!session)
    return parseServerActionResponse({
      error: "Unauthorized",
      status: "Error",
    });

  const { title, description, category, link } = Object.fromEntries(
    Array.from(form).filter(([key]) => key !== "details")
  ) as any;

  const slug = slugify(title as string, { lower: true, strict: true });

  try {
    await dbConnect();

    const doc = await Project.create({
      title,
      description,
      category,
      image: link,
      slug,
      author: session.id,
      details,
    });

    return parseServerActionResponse({
      _id: String(doc._id),
      error: "",
      status: "Success",
    });
  } catch (error) {
    console.log(error);
    return parseServerActionResponse({
      error: JSON.stringify(error),
      status: "Error",
    });
  }
};
