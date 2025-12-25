import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { LikeButton } from "@/components/like-button";
import { CommentForm } from "@/components/comment-form";
import { DeleteCommentButton } from "@/components/delete-comment-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      likes: {
        select: {
          userId: true,
        },
      },
      categories: true,
      tags: true,
    },
  });

  if (!post || (!post.published && post.authorId !== session?.user?.id)) {
    notFound();
  }

  // Update view count
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  const isLiked = session?.user?.id
    ? post.likes.some((like: typeof post.likes[0]) => like.userId === session.user.id)
    : false;

  const isAuthor = session?.user?.id === post.authorId;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              DevOps Blog
            </Link>
            <div className="flex items-center gap-4">
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 transition">
                    Dashboard
                  </Link>
                  {isAuthor && (
                    <Link
                      href={`/edit-post/${post.id}`}
                      className="text-indigo-600 hover:text-indigo-700 transition"
                    >
                      Edit Post
                    </Link>
                  )}
                </>
              ) : (
                <Link href="/login" className="text-gray-700 hover:text-gray-900 transition">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {post.coverImage && (
            <div className="h-96 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
          )}

          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-lg">
                      {post.author.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.author.name}</p>
                    <p className="text-sm text-gray-500">
                      {post.publishedAt && new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{post.viewCount} views</span>
                  <span>{post.likes.length} likes</span>
                  <span>{post.comments.length} comments</span>
                </div>
              </div>
            </div>

            {post.excerpt && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-indigo-600">
                <p className="text-lg text-gray-700 italic">{post.excerpt}</p>
              </div>
            )}

            <div className="prose max-w-none mb-8">
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </div>

            {(post.categories.length > 0 || post.tags.length > 0) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {post.categories.map((cat: typeof post.categories[0]) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                  >
                    {cat.name}
                  </span>
                ))}
                {post.tags.map((tag: typeof post.tags[0]) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t pt-6">
              <LikeButton
                postId={post.id}
                isLiked={isLiked}
                likeCount={post.likes.length}
                disabled={!session?.user}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({post.comments.length})
          </h2>

          {session?.user ? (
            <CommentForm postId={post.id} />
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600">
                <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Login
                </Link>{" "}
                to leave a comment
              </p>
            </div>
          )}

          <div className="space-y-6">
            {post.comments.map((comment: typeof post.comments[0]) => (
              <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-semibold">
                        {comment.user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{comment.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {(session?.user?.id === comment.userId || session?.user?.role === "ADMIN") && (
                    <DeleteCommentButton commentId={comment.id} />
                  )}
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
