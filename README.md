<div align="center">

# 🚀 ProjectHub

**Discover. Build. Share.**

A premium, full-stack project-sharing platform where developers showcase their work,  
gather feedback, track analytics, and connect with a global creator community.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

[**Live Demo →**](https://project-hub-yt.vercel.app) &nbsp;·&nbsp; [Report Bug](https://github.com/surajpsharma/projectHub/issues) &nbsp;·&nbsp; [Request Feature](https://github.com/surajpsharma/projectHub/issues)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [OAuth Setup](#-oauth-setup)
- [Database Schema](#-database-schema)
- [Architecture](#-architecture)
- [Pages & Routes](#-pages--routes)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 About

**ProjectHub** is a production-ready developer platform inspired by Product Hunt, GitHub, and Dev.to. It lets developers, designers, and students:

- 🏗️ **Showcase** projects with rich Markdown descriptions, screenshots, and tech stacks
- 🔍 **Discover** work from creators worldwide, filterable by technology and category
- 💬 **Gather** structured feedback with star ratings from the community
- 📊 **Track** real-time views and likes with deduplicated cookie analytics
- 🤝 **Connect** with other creators through public profiles and dashboards

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 **Multi-Provider Auth** | GitHub & Google OAuth via Auth.js (NextAuth v5) with persistent user creation |
| 🌗 **Theme System** | Light, Dark, and System themes with zero flash on load (`next-themes`) |
| 🗂️ **Project Discovery** | Category tabs, technology filters, full-text search, and paginated results |
| 📝 **Rich Markdown Editor** | Multi-step form with live Markdown preview (`@uiw/react-md-editor`) |
| 📈 **View Analytics** | Deduplicated view counting via 24h cookie hashing, no duplicates |
| ❤️ **Likes System** | Optimistic UI likes with instant toggle and server sync |
| 💬 **Feedback Threads** | Star-rated comments with delete controls for authors and project owners |
| 📊 **Creator Dashboard** | Stats cards, activity feed, and full CRUD project management table |
| ⚙️ **Profile Settings** | Edit name, bio, avatar URL, GitHub, portfolio, and social links |
| 🔍 **SEO Ready** | Dynamic metadata, OG/Twitter cards, `sitemap.xml`, and `robots.txt` |
| 📱 **Fully Responsive** | Mobile-first design that works seamlessly on all screen sizes |
| 🎨 **Premium Design** | Glassmorphism, smooth gradients, micro-animations, and hover effects |

---

## 🛠️ Tech Stack

### Core
| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org/) | 15 (Canary) | Full-stack framework with App Router & Server Actions |
| [React](https://react.dev/) | 19 | UI rendering with concurrent features |
| [TypeScript](https://www.typescriptlang.org/) | 5 | Type safety across the entire codebase |

### Styling & UI
| Technology | Purpose |
|-----------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | Page & component animations |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Radix UI](https://www.radix-ui.com/) | Accessible headless components (Toast, Slot) |

### Database & Auth
| Technology | Purpose |
|-----------|---------|
| [MongoDB Atlas](https://www.mongodb.com/) | Cloud NoSQL database |
| [Mongoose](https://mongoosejs.com/) | ODM with schema validation & indexing |
| [Auth.js v5](https://authjs.dev/) | OAuth authentication (GitHub + Google) |

### Content & Utilities
| Technology | Purpose |
|-----------|---------|
| [@uiw/react-md-editor](https://uiwjs.github.io/react-md-editor/) | Markdown editor with live preview |
| [markdown-it](https://markdown-it.github.io/) | Server-side Markdown rendering |
| [Slugify](https://github.com/simov/slugify) | SEO-friendly URL slug generation |
| [Zod](https://zod.dev/) | Runtime schema validation (v4) |
| [@vercel/analytics](https://vercel.com/analytics) | Web analytics |

---

## 📁 Project Structure

```
projectHub/
├── app/
│   ├── (root)/                    # Main app routes (with shared NavBar + Footer)
│   │   ├── page.tsx               # Home page — featured, trending, recent projects
│   │   ├── projects/
│   │   │   ├── page.tsx           # All projects with search & filters
│   │   │   ├── create/page.tsx    # Multi-step project submission form
│   │   │   ├── [slug]/page.tsx    # Individual project detail page
│   │   │   └── [id]/edit/page.tsx # Edit existing project
│   │   ├── creators/
│   │   │   ├── page.tsx           # All creators listing
│   │   │   └── [username]/page.tsx# Public creator profile
│   │   ├── technologies/
│   │   │   ├── page.tsx           # Technologies overview
│   │   │   └── [slug]/page.tsx    # Projects filtered by technology
│   │   ├── dashboard/page.tsx     # Creator dashboard with analytics
│   │   └── settings/page.tsx      # Profile settings
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth route handler
│   │   ├── project-like/          # Like/unlike toggle endpoint
│   │   ├── image-proxy/           # External image proxy (CORS bypass)
│   │   └── feedback/              # Feedback submission endpoint
│   ├── layout.tsx                 # Root layout (fonts, ThemeProvider, Analytics)
│   ├── globals.css                # Global styles & custom animations
│   ├── sitemap.ts                 # Dynamic XML sitemap
│   └── robots.txt                 # Search engine crawl rules
│
├── components/
│   ├── NavBar.tsx                 # Sticky header with auth-aware navigation
│   ├── Footer.tsx                 # Site footer
│   ├── ProjectCard.tsx            # Reusable project card component
│   ├── LikeButton.tsx             # Optimistic like/unlike button
│   ├── Views.tsx                  # View counter with cookie deduplication
│   ├── ThemeProvider.tsx          # next-themes wrapper
│   ├── ThemeToggle.tsx            # Light/Dark/System theme switcher
│   ├── projects/
│   │   ├── MultiStepForm.tsx      # 5-step project creation wizard
│   │   ├── EditProjectForm.tsx    # Edit project form
│   │   └── FeedbackSection.tsx    # Comments & star ratings
│   ├── dashboard/
│   │   ├── DashboardTable.tsx     # Project management CRUD table
│   │   └── SettingsForm.tsx       # Profile update form
│   └── ui/
│       ├── button.tsx             # Button variants
│       ├── card.tsx               # Card component
│       ├── badge.tsx              # Technology badge
│       ├── toast.tsx              # Toast notification
│       ├── safe-image.tsx         # Image with fallback & proxy support
│       └── loading-skeleton.tsx   # Loading skeleton screens
│
├── lib/
│   ├── mongodb.ts                 # Mongoose connection with global caching
│   ├── action.ts                  # Server Actions: createProject, updateProject, deleteProject
│   ├── validation.ts              # Zod schemas for forms and profiles
│   ├── utils.ts                   # Utility helpers
│   ├── models/
│   │   ├── Author.ts              # Creator/User Mongoose model
│   │   ├── Project.ts             # Project Mongoose model
│   │   └── Feedback.ts            # Feedback/Comment Mongoose model
│   └── actions/
│       ├── feedback.ts            # createFeedback, deleteFeedback server actions
│       └── profile.ts             # updateProfile server action
│
├── hooks/
│   └── use-toast.ts               # Custom toast hook
├── types/                         # Shared TypeScript type definitions
├── auth.ts                        # NextAuth configuration (providers + callbacks)
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
└── .env.example                   # Environment variable template
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB Atlas** account (or a local MongoDB instance)
- **GitHub OAuth App** credentials
- **Google OAuth App** credentials

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/surajpsharma/projectHub.git
   cd projectHub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Then fill in all required values in `.env.local` (see [Environment Variables](#-environment-variables)).

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production** *(optional — to verify the build)*

   ```bash
   npm run build
   npm run start
   ```

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root using `.env.example` as a template:

```env
# ──────────────────────────────────────────────────────────────
# Auth.js (NextAuth) — Session Signing Secret
# Generate one: npx auth secret
# ──────────────────────────────────────────────────────────────
AUTH_SECRET=your_auth_secret_here

# ──────────────────────────────────────────────────────────────
# GitHub OAuth App
# Create at: https://github.com/settings/developers
# Callback URL: http://localhost:3000/api/auth/callback/github
# ──────────────────────────────────────────────────────────────
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret

# ──────────────────────────────────────────────────────────────
# Google OAuth App
# Create at: https://console.cloud.google.com/
# Callback URL: http://localhost:3000/api/auth/callback/google
# ──────────────────────────────────────────────────────────────
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# ──────────────────────────────────────────────────────────────
# MongoDB Connection
# ──────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB=projecthub
```

---

## 🔒 OAuth Setup

### GitHub OAuth App

1. Go to **GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Set **Homepage URL** to `http://localhost:3000` (or your Vercel URL)
3. Set **Authorization callback URL** to:
   ```
   http://localhost:3000/api/auth/callback/github
   # Production:
   https://your-app.vercel.app/api/auth/callback/github
   ```
4. Copy **Client ID** and **Client Secret** into your `.env.local`

### Google OAuth App

1. Go to **Google Cloud Console → APIs & Services → Credentials → Create OAuth 2.0 Client**
2. Add **Authorized redirect URI**:
   ```
   http://localhost:3000/api/auth/callback/google
   # Production:
   https://your-app.vercel.app/api/auth/callback/google
   ```
3. Copy **Client ID** and **Client Secret** into your `.env.local`

---

## 🗄️ Database Schema

### `Author` (Users / Creators)

```typescript
{
  providerId: String,        // OAuth provider unique ID
  provider:   "github" | "google",
  name:       String,        // Display name
  username:   String,        // URL-safe username (indexed)
  email:      String,        // User email (indexed)
  image:      String,        // Avatar URL
  bio:        String,        // Short biography
  instagram:  String,
  github:     String,        // GitHub profile URL
  portfolio:  String,        // Portfolio URL
  twitter:    String,
  linkedin:   String,
  _createdAt: Date,          // Mongoose timestamps
  _updatedAt: Date,
}
```

### `Project`

```typescript
{
  title:            String,          // Required
  slug:             String,          // Unique URL slug (indexed)
  description:      String,          // Short description
  category:         String,          // Project category
  coverImage:       String,          // Thumbnail URL
  image:            String,          // Alias for coverImage
  author:           ObjectId → Author,  // Required (indexed)
  details:          String,          // Long Markdown description
  views:            Number,          // View count (default: 0)
  likes:            ObjectId[],      // Array of Author IDs who liked
  technologies:     String[],        // Tech stack tags (indexed)
  githubUrl:        String,
  liveUrl:          String,
  documentationUrl: String,
  screenshots:      String[],        // Screenshot image URLs
  status:           "Draft" | "Published",
  _createdAt:       Date,
  _updatedAt:       Date,
}
```

### `Feedback` (Comments)

```typescript
{
  name:     String,              // Reviewer's display name
  email:    String,              // Reviewer's email
  message:  String,              // Required — review text
  rating:   Number (1–5),       // Optional star rating
  user:     ObjectId → Author,  // Reviewer reference (indexed)
  project:  ObjectId → Project, // Associated project (indexed)
  _createdAt: Date,
}
```

---

## 🏗️ Architecture

```mermaid
graph TD
    Browser["🌐 Browser / Client"]
    NextApp["⚡ Next.js 15\nApp Router + SSR"]
    AuthJS["🔐 Auth.js v5\nGitHub & Google OAuth"]
    ServerActions["⚙️ Server Actions\ncreate / update / delete"]
    APIRoutes["🛣️ API Routes\nlikes · image-proxy · feedback"]
    Mongoose["🍃 Mongoose ODM"]
    MongoDB[("🗄️ MongoDB Atlas")]
    Vercel["☁️ Vercel\nEdge Network"]

    Browser -->|Page Requests| NextApp
    Browser -->|OAuth Sign-In| AuthJS
    Browser -->|Likes / Feedback| APIRoutes
    Browser -->|Form Submissions| ServerActions
    AuthJS -.->|Session Validation| ServerActions
    AuthJS -.->|Session Validation| APIRoutes
    ServerActions --> Mongoose
    APIRoutes --> Mongoose
    Mongoose --> MongoDB
    NextApp --> Vercel
```

---

## 📄 Pages & Routes

| Route | Description | Auth Required |
|-------|-------------|:---:|
| `/` | Home — featured, trending & recent projects | ❌ |
| `/projects` | All projects with search, filter & pagination | ❌ |
| `/projects/[slug]` | Individual project detail with feedback | ❌ |
| `/projects/create` | Multi-step project submission wizard | ✅ |
| `/projects/[id]/edit` | Edit an existing project | ✅ Owner |
| `/creators` | Browse all creators | ❌ |
| `/creators/[username]` | Public creator profile & their projects | ❌ |
| `/technologies` | Technology tag overview | ❌ |
| `/technologies/[slug]` | Projects filtered by a technology | ❌ |
| `/dashboard` | Creator analytics dashboard | ✅ |
| `/settings` | Profile & account settings | ✅ |

---

## 🔮 Future Roadmap

- [ ] **Collaborative Projects** — Co-author assignment and team-based project pages
- [ ] **GitHub API Sync** — Auto-pull repository stats, star counts, and language tags
- [ ] **Image Upload** — Direct image uploads to Cloudinary or Amazon S3 (replacing URL-only input)
- [ ] **Notification System** — In-app alerts for new likes, feedback, and follows
- [ ] **Follow Creators** — Follow/unfollow creators and a personalized activity feed
- [ ] **Project Collections** — Save and curate projects into personal bookmarks or playlists
- [ ] **Advanced Search** — Full-text search with Elasticsearch or MongoDB Atlas Search

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes with a descriptive message:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to your branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📫 Connect with me

- **GitHub:** [@surajpsharma](https://github.com/surajpsharma)
- **Instagram:** [@suraj\_\_sharma\_\_](https://www.instagram.com/__suraj__sharma____)
- **Email:** [surajsharma030805@gmail.com](mailto:surajsharma030805@gmail.com)

---

<div align="center">

Made with ❤️ by [Suraj Sharma](https://github.com/surajpsharma)

⭐ **Star this repo** if you found it helpful!

</div>
