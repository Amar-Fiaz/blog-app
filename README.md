# DevOps Blog - Full-Stack Next.js Application

A modern, full-featured blog platform built with Next.js 15, Prisma, PostgreSQL, and NextAuth. Designed for DevOps and technical content creators.

## Features

### Authentication & Authorization
- **NextAuth v5** integration with credentials provider
- Role-based access control (USER, ADMIN, MODERATOR)
- Secure password hashing with bcryptjs
- Protected routes with middleware
- Session management with JWT

### Blog Features
- Create, read, update, and delete blog posts
- Draft and publish workflow
- Post likes and view counts
- Comments system with nested replies
- Categories and tags support
- Rich text content support
- Post excerpts and cover images
- SEO-friendly slugs

### User Dashboard
- Personal dashboard for authors
- Post management (edit, delete)
- Statistics (total posts, likes, views)
- Draft and published post overview

### Admin Dashboard
- User management overview
- All posts management
- Recent comments monitoring
- Platform-wide statistics
- Content moderation capabilities

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Server Components** - Optimized rendering

### Backend
- **Next.js API Routes** - Serverless functions
- **Server Actions** - Type-safe server mutations
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **NextAuth** - Authentication solution

### DevOps
- **Docker** - Containerization
- **Kubernetes** - Container orchestration
- **Jenkins** - CI/CD pipeline
- **Terraform** - Infrastructure as Code
- **Prometheus** - Monitoring
- **Grafana** - Metrics visualization

## Project Structure

```
blog-app/
├── actions/              # Server actions
│   ├── auth.ts          # Authentication actions
│   ├── posts.ts         # Post CRUD operations
│   └── comments.ts      # Comment operations
├── app/
│   ├── (auth)/          # Auth route group
│   │   ├── login/       # Login page
│   │   └── register/    # Registration page
│   ├── admin/           # Admin dashboard
│   ├── api/
│   │   ├── auth/        # NextAuth endpoints
│   │   └── posts/       # Post API routes
│   ├── create-post/     # Create post page
│   ├── dashboard/       # User dashboard
│   ├── edit-post/       # Edit post page
│   ├── post/            # Post detail page
│   └── page.tsx         # Home page
├── lib/
│   └── prisma.ts        # Prisma client
├── prisma/
│   └── schema.prisma    # Database schema
├── schema/
│   └── index.ts         # Zod validation schemas
├── types/
│   └── next-auth.d.ts   # NextAuth type extensions
├── auth.ts              # NextAuth configuration
└── middleware.ts        # Route protection
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 17
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd blog-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
AUTH_SECRET="your-secret-key"
```

4. Generate Prisma client
```bash
npx prisma generate
```

5. Push database schema
```bash
npx prisma db push
```

6. Run development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Models
- **User** - User accounts with authentication
- **Post** - Blog posts with rich content
- **Comment** - Nested comments on posts
- **Like** - Post likes tracking
- **Category** - Post categorization
- **Tag** - Post tagging system

### NextAuth Models
- **Account** - OAuth accounts
- **Session** - User sessions
- **VerificationToken** - Email verification

## API Routes

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get session

### Posts
- `GET /api/posts/[id]` - Get single post (authenticated)

### Server Actions
- `createPost(data)` - Create new post
- `updatePost(id, data)` - Update post
- `deletePost(id)` - Delete post
- `togglePostLike(postId)` - Like/unlike post
- `createComment(data)` - Add comment
- `deleteComment(id)` - Delete comment
- `register(data)` - User registration

## Deployment

### EC2 Instance Setup
The application is designed to run on an AWS EC2 instance with:
- PostgreSQL database (localhost for security)
- Docker for containerization
- Kubernetes for orchestration
- Jenkins for CI/CD

### Database Security
The PostgreSQL database is configured to listen only on localhost for security. The application and database run on the same EC2 instance to avoid exposing the database publicly.

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/database"

# Authentication
AUTH_SECRET="generated-secret-key"

# Optional
NODE_ENV="development"
```

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Run migrations
npx prisma migrate dev --name init
```

## Security Features

- Password hashing with bcrypt
- JWT session tokens
- CSRF protection
- SQL injection prevention (Prisma)
- XSS protection
- Role-based access control
- Protected API routes
- Secure environment variables

## License

This project is licensed under the MIT License.

## Webhook Integration
Jenkins pipeline triggers automatically on GitHub push via webhook.
