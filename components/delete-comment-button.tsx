"use client";

import { useRouter } from "next/navigation";
import { deleteComment } from "@/actions/comments";

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this comment?")) {
      return;
    }

    await deleteComment(commentId);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-sm text-red-600 hover:text-red-700"
    >
      Delete
    </button>
  );
}
