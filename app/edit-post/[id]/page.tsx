"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePost } from "@/actions/posts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: PageProps) {
  const router = useRouter();
  const [postId, setPostId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    params.then(({ id }) => {
      setPostId(id);
      // Fetch post data
      fetch(`/api/posts/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
            setIsLoading(false);
            return;
          }
          setTitle(data.title);
          setSlug(data.slug);
          setContent(data.content);
          setExcerpt(data.excerpt || "");
          if (data.coverImage) {
            setCoverImagePreview(data.coverImage);
          }
          setPublished(data.published);
          setIsLoading(false);
        })
        .catch((err) => {
          setError("Failed to load post");
          setIsLoading(false);
        });
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const newSlug = generateSlug(title);

      const result = await updatePost(postId, {
        title,
        slug: newSlug,
        content,
        excerpt: excerpt || undefined,
        coverImage: coverImagePreview || undefined,
        published,
      });

      if (!result.success) {
        setError(result.error || "Failed to update post");
        setIsSaving(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Update post error:", error);
      setError("An error occurred while updating the post");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              DevOps Blog
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-gray-900 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Post</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="Enter post title"
                disabled={isSaving}
              />
              <p className="mt-1 text-sm text-gray-500">
                Slug will be auto-generated from the title
              </p>
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                placeholder="Brief description of your post"
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm text-gray-900"
                placeholder="Write your post content here... (Markdown supported)"
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <input
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                disabled={isSaving}
              />
              {coverImagePreview && (
                <div className="mt-3">
                  <img
                    src={coverImagePreview}
                    alt="Cover preview"
                    className="max-w-sm rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={isSaving}
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Published
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition font-medium"
              >
                {isSaving ? "Saving..." : "Update Post"}
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
