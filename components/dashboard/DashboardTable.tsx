"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { deleteProject } from '@/lib/action';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit3, Eye, Trash2, ArrowUpRight } from 'lucide-react';

interface ProjectRow {
  _id: string;
  title: string;
  slug?: string;
  category: string;
  status: "Draft" | "Published";
  views: number;
  likesCount: number;
  createdAt: string;
}

interface DashboardTableProps {
  initialProjects: ProjectRow[];
}

export default function DashboardTable({ initialProjects }: DashboardTableProps) {
  const [projects, setProjects] = useState<ProjectRow[]>(initialProjects);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to permanently delete this project? This action cannot be undone.")) return;

    startTransition(async () => {
      const res = await deleteProject(projectId);
      if (res.status === 'Success') {
        toast({
          title: "Project Deleted",
          description: "Your project has been successfully removed.",
        });
        setProjects(projects.filter(p => p._id !== projectId));
      } else {
        toast({
          title: "Deletion Failed",
          description: res.error || "An error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You haven't shared any projects yet.
        </p>
        <Link href="/projects/create">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-4 px-6 rounded-lg">
            Publish Your First Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop view Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm text-gray-500 dark:text-gray-400">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-850 text-xs text-gray-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-4 font-extrabold">Project</th>
              <th className="py-3 px-4 font-extrabold text-center">Status</th>
              <th className="py-3 px-4 font-extrabold text-center">Views</th>
              <th className="py-3 px-4 font-extrabold text-center">Likes</th>
              <th className="py-3 px-4 font-extrabold text-center">Created</th>
              <th className="py-3 px-4 font-extrabold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const formattedDate = new Date(p.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <tr key={p._id} className="border-b border-gray-100 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                  {/* Name & Category */}
                  <td className="py-4 px-4 font-bold text-gray-900 dark:text-white max-w-[200px] truncate">
                    <div>{p.title}</div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase mt-0.5">{p.category}</div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 text-center">
                    <Badge variant={p.status === "Published" ? "default" : "secondary"} className={`text-[10px] font-bold border ${
                      p.status === "Published"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 shadow-none hover:bg-green-500/10"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-none shadow-none hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}>
                      {p.status}
                    </Badge>
                  </td>

                  {/* Views */}
                  <td className="py-4 px-4 text-center font-semibold text-gray-700 dark:text-gray-300">
                    {p.views.toLocaleString()}
                  </td>

                  {/* Likes */}
                  <td className="py-4 px-4 text-center font-semibold text-gray-700 dark:text-gray-300">
                    {p.likesCount}
                  </td>

                  {/* Created */}
                  <td className="py-4 px-4 text-center text-xs">
                    {formattedDate}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/projects/${p.slug || p._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-500 rounded-md" title="View details">
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/projects/${p._id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-yellow-600 rounded-md" title="Edit project">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(p._id)}
                        disabled={isPending}
                        className="h-8 w-8 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile view Card List */}
      <div className="sm:hidden space-y-4">
        {projects.map((p) => (
          <div key={p._id} className="p-4 bg-gray-50/50 dark:bg-gray-950 rounded-xl border border-gray-150 dark:border-gray-850 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{p.title}</h4>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">{p.category}</span>
              </div>
              <Badge variant={p.status === "Published" ? "default" : "secondary"} className="text-[9px] font-bold">
                {p.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 border-y border-gray-100 dark:border-gray-850 py-2">
              <span className="flex items-center gap-1">
                <strong>Views:</strong> {p.views}
              </span>
              <span className="flex items-center gap-1">
                <strong>Likes:</strong> {p.likesCount}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Link href={`/projects/${p.slug || p._id}`}>
                <Button variant="outline" size="sm" className="h-8 text-xs font-bold px-3">
                  View
                </Button>
              </Link>
              <Link href={`/projects/${p._id}/edit`}>
                <Button variant="outline" size="sm" className="h-8 text-xs font-bold px-3 hover:border-yellow-500 hover:text-yellow-600">
                  Edit
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(p._id)}
                disabled={isPending}
                className="h-8 w-8 hover:text-red-500 hover:bg-red-50 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
