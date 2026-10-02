"use client";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LikeButton({
  projectId,
  initialLiked,
  initialCount,
}: {
  projectId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const toggle = async () => {
    const next = !liked;
    
    // Optimistic Update
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));

    startTransition(async () => {
      try {
        const res = await fetch(`/api/project-like`, {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        
        if (res.status === 401) {
          throw new Error("unauthorized");
        }
        if (!res.ok) throw new Error("failed");
      } catch (e: any) {
        // Revert on error
        setLiked((v) => !v);
        setCount((c) => c + (next ? -1 : 1));

        if (e.message === "unauthorized") {
          toast({
            title: "Sign in required",
            description: "Please sign in to like projects.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update project like status. Please try again.",
            variant: "destructive",
          });
        }
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 ${
        liked
          ? "bg-rose-50 text-rose-600 border-rose-250 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30 shadow-sm"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-850 dark:hover:border-gray-800 dark:hover:bg-gray-800/50"
      }`}
    >
      <Heart className={`w-3.5 h-3.5 ${liked ? "fill-rose-500 text-rose-500" : "text-gray-500"}`} />
      <span>{count}</span>
    </button>
  );
}