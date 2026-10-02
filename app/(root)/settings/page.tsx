import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import Author from '@/lib/models/Author';
import SettingsForm from '@/components/dashboard/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  await dbConnect();
  const user = await Author.findById(session.id).lean();
  if (!user || Array.isArray(user)) {
    redirect("/");
  }

  const profileData = {
    name: user.name || "",
    username: user.username || "",
    email: user.email || "",
    bio: user.bio || "",
    instagram: user.instagram || "",
    github: user.github || "",
    portfolio: user.portfolio || "",
    twitter: user.twitter || "",
    linkedin: user.linkedin || "",
    image: user.image || "",
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <SettingsForm initialProfile={profileData} />
      </div>
    </div>
  );
}
