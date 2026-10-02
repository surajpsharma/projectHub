import { Eye } from 'lucide-react';
import React from 'react';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { cookies } from 'next/headers';
import { isValidObjectId } from 'mongoose';

const Views = async ({ id }: { id: string }) => {
  await dbConnect();

  // Find by ID or slug to get the correct project ID and current view count
  const projectQuery = isValidObjectId(id)
    ? Project.findById(id)
    : Project.findOne({ slug: id });

  const project = await projectQuery.select('_id views').lean();
  if (!project || Array.isArray(project)) return null;

  const projectId = String(project._id);
  const cookieStore = await cookies();
  const viewedCookie = cookieStore.get('viewed_projects')?.value || '';
  const viewedIds = viewedCookie ? viewedCookie.split(',') : [];

  let finalViews = project.views || 0;

  // If user hasn't viewed this project in the last 24 hours, increment count
  if (!viewedIds.includes(projectId)) {
    const updated = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { views: 1 } },
      { new: true, select: 'views' }
    ).lean();

    if (updated && !Array.isArray(updated)) {
      finalViews = (updated as any).views ?? finalViews;
    }

    viewedIds.push(projectId);
    
    // Set cookie, limiting size to last 50 viewed items to avoid huge headers
    const restrictedList = viewedIds.slice(-50);
    cookieStore.set('viewed_projects', restrictedList.join(','), {
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return (
    <div className="view-container z-40">
      <div className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none select-none">
        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#c7d2fe_0%,#3b82f6_50%,#c7d2fe_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#1e293b_0%,#60a5fa_50%,#1e293b_100%)]" />
        <span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-gray-950 px-4 py-1 text-xs font-bold text-gray-700 dark:text-gray-250 backdrop-blur-3xl border border-gray-150/50 dark:border-gray-800/50">
          <Eye className="w-4 h-4 mr-1.5 text-blue-500" />
          <span>{finalViews.toLocaleString()} Views</span>
        </span>
      </div>
    </div>
  );
};

export default Views;