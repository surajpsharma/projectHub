import { Eye } from 'lucide-react';
import React from 'react'
import { dbConnect } from '@/lib/mongodb';
import Project from '@/lib/models/Project';

const Views = async ({ id }: { id: string }) => {
  await dbConnect();
  const updated = await Project.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true, select: 'views' }
  ).lean();
  // Guard against null and incorrect array type from mongoose typings
  const views: number = updated && !Array.isArray(updated) ? (updated as any).views ?? 0 : 0;

  return <div className='view-container'>
    <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
        <Eye className='size-6 mr-2' /> {views} Views
      </span>
    </button>
  </div>
}

export default Views