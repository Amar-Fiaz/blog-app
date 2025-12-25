import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { DeletePostButton } from "@/components/delete-post-button";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [users, posts, comments, stats] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.comment.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        post: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    {
      totalUsers: await prisma.user.count(),
      totalPosts: await prisma.post.count(),
      publishedPosts: await prisma.post.count({ where: { published: true } }),
      totalComments: await prisma.comment.count(),
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              DevOps Blog
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 transition">
                My Dashboard
              </Link>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">
                ADMIN
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Posts</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats.totalPosts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Published</h3>
            <p className="text-3xl font-bold text-green-600">{stats.publishedPosts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Comments</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalComments}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {users.map((user: typeof users[0]) => (
                <div key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-600">{user._count.posts} posts</p>
                      <p className="text-gray-600">{user._count.comments} comments</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        user.role === "ADMIN"
                          ? "bg-red-100 text-red-800"
                          : user.role === "MODERATOR"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-900">Recent Comments</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {comments.map((comment: typeof comments[0]) => (
                <div key={comment.id} className="px-6 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{comment.user.name}</p>
                      <p className="text-xs text-gray-500">
                        on "{comment.post.title}"
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">All Posts</h2>
          </div>
          <div className="divide-y">
            {posts.map((post: typeof posts[0]) => (
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
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {post.author.name}</span>
                      <span>{post._count.likes} likes</span>
                      <span>{post._count.comments} comments</span>
                      <span>{post.viewCount} views</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
