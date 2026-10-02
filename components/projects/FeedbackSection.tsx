"use client";

import React, { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { MessageSquare, Trash2, Calendar, Star, Send, ShieldAlert } from 'lucide-react';
import { createFeedback, deleteFeedback } from '@/lib/actions/feedback';
import Link from 'next/link';

interface FeedbackItem {
  _id: string;
  name: string;
  email?: string;
  message: string;
  rating?: number;
  user?: string;
  _createdAt?: string | Date;
}

interface FeedbackSectionProps {
  projectId: string;
  initialFeedbacks: FeedbackItem[];
  currentUserId: string | null;
  isProjectOwner: boolean;
}

export default function FeedbackSection({
  projectId,
  initialFeedbacks,
  currentUserId,
  isProjectOwner,
}: FeedbackSectionProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialFeedbacks);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handlePostFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    startTransition(async () => {
      const res = await createFeedback(projectId, message, rating || undefined);
      if (res.status === 'Success') {
        toast({
          title: "Feedback posted",
          description: "Thank you for sharing your feedback!",
        });
        
        // Add optimistically or refetch. Since we revalidated on the server, we can construct the item locally or reload:
        const newItem: FeedbackItem = {
          _id: res.feedbackId || String(Date.now()),
          name: "You",
          message: message,
          rating: rating || undefined,
          user: currentUserId || undefined,
          _createdAt: new Date(),
        };
        setFeedbacks([newItem, ...feedbacks]);
        setMessage('');
        setRating(null);
      } else {
        toast({
          title: "Failed to post feedback",
          description: res.error || "An error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    startTransition(async () => {
      const res = await deleteFeedback(feedbackId);
      if (res.status === 'Success') {
        toast({
          title: "Feedback deleted",
          description: "Your feedback comment has been removed.",
        });
        setFeedbacks(feedbacks.filter(f => f._id !== feedbackId));
      } else {
        toast({
          title: "Failed to delete feedback",
          description: res.error || "An error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-850 pb-4">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Feedback & Reviews ({feedbacks.length})
        </h3>
      </div>

      {/* New Feedback Form */}
      {currentUserId ? (
        <form onSubmit={handlePostFeedback} className="space-y-4 bg-gray-50/50 dark:bg-gray-900/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-850">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Leave your feedback *
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What do you think? Share constructive reviews, bugs, or feature suggestions..."
              rows={4}
              required
              className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-850 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Rating Stars Selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Rating (optional):</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star === rating ? null : star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= (rating || 0)
                          ? "fill-yellow-450 text-yellow-450"
                          : "text-gray-300 dark:text-gray-600 hover:text-yellow-450"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-900/20 border border-dashed border-gray-200 dark:border-gray-800 p-6 rounded-2xl text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please <Link href="/projects" className="text-blue-500 font-bold hover:underline">sign in</Link> to leave feedback and reviews.
          </p>
        </div>
      )}

      {/* Feedback Feed */}
      {feedbacks.length > 0 ? (
        <div className="space-y-4">
          {feedbacks.map((item) => {
            const isMyComment = String(item.user) === currentUserId;
            const canDelete = isMyComment || isProjectOwner;
            const dateStr = item._createdAt
              ? new Date(item._createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recently';

            return (
              <div
                key={item._id}
                className="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-start"
              >
                <div className="space-y-2 flex-1">
                  {/* Name and Rating */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {item.name}
                    </span>
                    {isMyComment && (
                      <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-100/50">
                        You
                      </span>
                    )}
                    {item.rating && (
                      <div className="flex gap-0.5 ml-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < (item.rating || 0)
                                ? "fill-yellow-450 text-yellow-450"
                                : "text-gray-200 dark:text-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Comment Message */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">
                    {item.message}
                  </p>

                  {/* Date details */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateStr}</span>
                  </div>
                </div>

                {/* Delete button */}
                {canDelete && (
                  <button
                    onClick={() => handleDeleteFeedback(item._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all self-end sm:self-start shrink-0"
                    title={isProjectOwner && !isMyComment ? "Delete as Project Owner" : "Delete comment"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          No feedback has been left yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
}
