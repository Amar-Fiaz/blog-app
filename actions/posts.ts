"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { postSchema, type PostInput } from "@/schema";

export async function createPost(data: PostInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = postSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0].message,
      };
    }

    const { title, slug, content, excerpt, coverImage, published, categories, tags } = validated.data;

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return {
        success: false,
        error: "A post with this slug already exists",
      };
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
        categories: categories
          ? {
              connectOrCreate: categories.map((cat) => ({
                where: { slug: cat },
                create: { name: cat, slug: cat },
              })),
            }
          : undefined,
        tags: tags
          ? {
              connectOrCreate: tags.map((tag) => ({
                where: { slug: tag },
                create: { name: tag, slug: tag },
              })),
            }
          : undefined,
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Post created successfully",
      postId: post.id,
    };
  } catch (error) {
    console.error("Create post error:", error);
    return {
      success: false,
      error: "An error occurred while creating the post",
    };
  }
}

export async function updatePost(postId: string, data: PostInput) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = postSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0].message,
      };
    }

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    if (existingPost.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "You don't have permission to edit this post" };
    }

    const { title, slug, content, excerpt, coverImage, published } = validated.data;

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        published,
        publishedAt: published && !existingPost.published ? new Date() : existingPost.publishedAt,
      },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath(`/post/${post.slug}`);

    return {
      success: true,
      message: "Post updated successfully",
      postId: post.id,
    };
  } catch (error) {
    console.error("Update post error:", error);
    return {
      success: false,
      error: "An error occurred while updating the post",
    };
  }
}

export async function deletePost(postId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return { success: false, error: "Post not found" };
    }

    if (existingPost.authorId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "You don't have permission to delete this post" };
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error) {
    console.error("Delete post error:", error);
    return {
      success: false,
      error: "An error occurred while deleting the post",
    };
  }
}

export async function togglePostLike(postId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return { success: true, liked: false };
    } else {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Toggle like error:", error);
    return {
      success: false,
      error: "An error occurred while toggling the like",
    };
  }
}
