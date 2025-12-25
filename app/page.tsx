import Link from "next/link";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function Home() {
  const session = await auth();

  const posts = await prisma.post.findMany({
    where: { published: true },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 10,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              DevOps Blog
            </Link>
            <div className="flex items-center gap-4">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-gray-900 transition"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/create-post"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    New Post
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to DevOps Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover insights about DevOps, Cloud Infrastructure, and Modern Development Practices
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No posts yet. Be the first to create one!</p>
            {session?.user && (
              <Link
                href="/create-post"
                className="inline-block mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                Create Your First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: typeof posts[0]) => (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {post.coverImage && (
                  <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">
                          {post.author.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{post._count.likes} likes</span>
                      <span>{post._count.comments} comments</span>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-gray-400">
                    {post.publishedAt && new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2024 DevOps Blog. Built with Next.js, Prisma, and PostgreSQL.
          </p>
        </div>
      </footer>
    </div>
  );
}
