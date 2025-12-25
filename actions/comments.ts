"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { commentSchema, type CommentInput } from "@/schema";

export async function createComment(data: CommentInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = commentSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0].message,
      };
    }

    const { content, postId, parentId } = validated.data;

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: session.user.id,
        parentId: parentId || null,
      },
    });

    revalidatePath(`/post/${postId}`);

    return {
      success: true,
      message: "Comment added successfully",
      commentId: comment.id,
    };
  } catch (error) {
    console.error("Create comment error:", error);
    return {
      success: false,
      error: "An error occurred while adding the comment",
    };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return { success: false, error: "Comment not found" };
    }

    if (existingComment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "You don't have permission to delete this comment" };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/post/${existingComment.postId}`);

    return {
      success: true,
      message: "Comment deleted successfully",
    };
  } catch (error) {
    console.error("Delete comment error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the comment",
    };
  }
}
