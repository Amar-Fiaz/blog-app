import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DeletePostButton } from "@/components/delete-post-button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    include: {
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    totalPosts: posts.length,
    publishedPosts: posts.filter((p: typeof posts[0]) => p.published).length,
    draftPosts: posts.filter((p: typeof posts[0]) => !p.published).length,
    totalLikes: posts.reduce((sum: number, p: typeof posts[0]) => sum + p._count.likes, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              DevOps Blog
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-indigo-600 font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/create-post"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                New Post
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600">Manage your blog posts and view your statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Posts</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalPosts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Published</h3>
            <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Drafts</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.draftPosts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Likes</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalLikes}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">Your Posts</h2>
          </div>
          <div className="divide-y">
            {posts.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-600 mb-4">You haven't created any posts yet.</p>
                <Link
                  href="/create-post"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
                >
                  Create Your First Post
                </Link>
              </div>
            ) : (
              posts.map((post: typeof posts[0]) => (
                <div key={post.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={`/post/${post.slug}`}
                          className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                        >
                          {post.title}
                        </Link>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            post.published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                      </div>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post._count.likes} likes</span>
                        <span>{post._count.comments} comments</span>
                        <span>{post.viewCount} views</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/edit-post/${post.id}`}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                      >
                        Edit
                      </Link>
                      <DeletePostButton postId={post.id} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
