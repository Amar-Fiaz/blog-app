import { z } from "zod";

// Login schema validation
export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register schema validation
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Post schema validation
export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().optional(),
  coverImage: z.url("Invalid image URL").optional(),
  published: z.boolean().default(false),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// Comment schema validation
export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  postId: z.string(),
  parentId: z.string().optional(),
});

// Category schema validation
export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
});

// Tag schema validation
export const tagSchema = z.object({
  name: z.string().min(2, "Tag name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TagInput = z.infer<typeof tagSchema>;
