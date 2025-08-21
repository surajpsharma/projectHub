"use client";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({ projectId, initialLiked, initialCount }: { projectId: string; initialLiked: boolean; initialCount: number; }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const toggle = async () => {
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));

    startTransition(async () => {
      try {
        const res = await fetch(`/api/project-like`, {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });
        if (!res.ok) throw new Error("Failed");
      } catch (e) {
        // revert on error
        setLiked((v) => !v);
        setCount((c) => c + (next ? -1 : 1));
      }
    });
  };

  return (
    <button onClick={toggle} disabled={isPending} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition ${liked ? "bg-pink-50 text-pink-600 border-pink-200" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
      <Heart className={`w-4 h-4 ${liked ? "fill-pink-500 text-pink-500" : "text-gray-500"}`} />
      <span className="text-sm">{count}</span>
    </button>
  );
}