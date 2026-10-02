import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Feedback from '@/lib/models/Feedback';
import DashboardTable from '@/components/dashboard/DashboardTable';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Heart, FolderOpen, MessageSquare, PlusCircle, LayoutDashboard, Clock } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }

  await dbConnect();

  // Fetch all projects owned by the current user
  const projectDocs = await Project.find({ author: session.id })
    .sort({ _createdAt: -1 })
    .lean();

  const projects = projectDocs.map((d: any) => ({
    _id: String(d._id),
    title: d.title,
    slug: d.slug,
    category: d.category,
    status: d.status || "Published",
    views: d.views || 0,
    likesCount: Array.isArray(d.likes) ? d.likes.length : 0,
    createdAt: d._createdAt?.toISOString?.() || new Date(d.createdAt || Date.now()).toISOString(),
  }));

  // Aggregate Stats
  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.status === "Published").length;
  const draftProjects = projects.filter(p => p.status === "Draft").length;
  const totalViews = projects.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = projects.reduce((sum, p) => sum + p.likesCount, 0);

  // Get feedbacks left on user's projects
  const myProjectIds = projectDocs.map(d => d._id);
  const feedbackCount = await Feedback.countDocuments({ project: { $in: myProjectIds } });

  const recentFeedbacksRaw = await Feedback.find({ project: { $in: myProjectIds } })
    .sort({ _createdAt: -1 })
    .limit(5)
    .populate('project', 'title slug')
    .lean();

  const recentFeedbacks = recentFeedbacksRaw.map((f: any) => ({
    _id: String(f._id),
    name: f.name,
    message: f.message,
    projectTitle: f.project?.title || "Unknown Project",
    projectSlug: f.project?.slug || "",
    createdAt: f._createdAt?.toISOString?.() || new Date(f.createdAt || Date.now()).toISOString(),
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-405 mt-1">
              Manage your projects, visibility states, and monitor performance.
            </p>
          </div>
        </div>

        <Link href="/projects/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-5 rounded-xl shadow-md shadow-blue-500/10 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </Button>
        </Link>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-gray-900 dark:text-white">
              {totalProjects}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mt-0.5">
              My Projects ({publishedProjects}p / {draftProjects}d)
            </span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-gray-900 dark:text-white">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mt-0.5">
              Total Views
            </span>
          </div>
        </div>

        {/* Total Likes */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-650 dark:text-rose-455 rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-gray-900 dark:text-white">
              {totalLikes}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mt-0.5">
              Total Likes
            </span>
          </div>
        </div>

        {/* Feedback comments */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-extrabold text-gray-900 dark:text-white">
              {feedbackCount}
            </span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mt-0.5">
              Total Reviews
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Management Table & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-gray-850 pb-3">
              Manage Projects
            </h3>
            
            <DashboardTable initialProjects={projects} />
          </div>
        </div>

        {/* Activity Feed Column */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-2xl shadow-sm space-y-4 h-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight border-b border-gray-100 dark:border-gray-850 pb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>Recent Activity</span>
            </h3>

            {recentFeedbacks.length > 0 ? (
              <div className="space-y-4">
                {recentFeedbacks.map((f) => (
                  <div key={f._id} className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900 dark:text-white">@{f.name}</span>
                      <span className="text-gray-400">
                        {new Date(f.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-405 line-clamp-2 italic leading-relaxed">
                      "{f.message}"
                    </p>
                    <div className="text-[10px] text-blue-500 font-semibold block pt-1">
                      on <Link href={`/projects/${f.projectSlug}`} className="hover:underline">{f.projectTitle}</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 dark:text-gray-550 text-sm">
                No recent activity or comments.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
