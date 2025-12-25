"use client";

import { useRouter } from "next/navigation";
import { deletePost } from "@/actions/posts";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    await deletePost(postId);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
    >
      Delete
    </button>
  );
}
