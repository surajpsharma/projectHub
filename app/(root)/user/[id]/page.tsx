import { dbConnect } from "@/lib/mongodb";
import Author from "@/lib/models/Author";
import { notFound, redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";

export const dynamic = 'force-dynamic';

export default async function UserProfileRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();

  const query = isValidObjectId(id)
    ? Author.findById(id)
    : Author.findOne({ username: id });

  const user = await query.select("username").lean();
  if (!user || Array.isArray(user)) return notFound();

  redirect(`/creators/${user.username}`);
}