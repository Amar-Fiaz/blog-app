"use client";

import { useRouter } from "next/navigation";
import { togglePostLike } from "@/actions/posts";

export function LikeButton({
  postId,
  isLiked,
  likeCount,
  disabled,
}: {
  postId: string;
  isLiked: boolean;
  likeCount: number;
  disabled?: boolean;
}) {
  const router = useRouter();

  const handleLike = async () => {
    await togglePostLike(postId);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
        isLiked
          ? "bg-red-100 text-red-600 hover:bg-red-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <svg
        className="w-5 h-5"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {isLiked ? "Unlike" : "Like"} ({likeCount})
    </button>
  );
}
