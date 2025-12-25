"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createComment } from "@/actions/comments";

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    await createComment({ content, postId });
    setContent("");
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        placeholder="Add a comment..."
        disabled={isSubmitting}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {isSubmitting ? "Posting..." : "Post Comment"}
      </button>
    </form>
  );
}
