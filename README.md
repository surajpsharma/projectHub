# ProjectHub

A Next.js app for sharing and discovering projects. It uses Auth.js (NextAuth) with GitHub/Google login, MongoDB (Mongoose), Tailwind CSS, and a few custom UI components. Optimized for Vercel deployment.

## Demo

- Production: (add your Vercel URL after deployment)

## Features

- GitHub and Google authentication (Auth.js v5)
- MongoDB connection with connection caching
- Project listing, likes, views, and feedback modules
- App Router (Next.js 15) with API routes
- Tailwind CSS + utility UI components
- Image proxy endpoint for safer remote image loading



## Screenshots
navbar:
<img width="1733" height="56" alt="projecthub5" src="https://github.com/user-attachments/assets/9b39321a-69ef-44e9-834c-0730c39b4f3e" />

craeterspage:
<img width="1818" height="916" alt="projecthub3" src="https://github.com/user-attachments/assets/c1b31152-bcf3-4979-bcab-859c940599e1" />

homepage:
<img width="1912" height="901" alt="projecthub2" src="https://github.com/user-attachments/assets/6eb73c7c-5219-437a-bfc5-6f485e5e5429" />

create page:
<img width="1916" height="955" alt="projecthub1" src="https://github.com/user-attachments/assets/36309435-eb02-4ea1-b0c3-2849149b7e8f" />


## Tech Stack

- Next.js 15 (App Router, TypeScript)
- React 19
- Auth.js (NextAuth) v5
- MongoDB + Mongoose
- Tailwind CSS

## Getting Started (Local Development)

1. Clone the repo and install dependencies

```bash
npm install
```

2. Create a `.env.local` file in the project root

```bash
# Auth.js (NextAuth)
AUTH_SECRET=replace-with-a-strong-secret

# GitHub OAuth (create an OAuth app at https://github.com/settings/developers)
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Google OAuth (create credentials at https://console.cloud.google.com/)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# MongoDB
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB=your-database-name

# Optional: for local if needed by your setup
# AUTH_URL=http://localhost:3000
```

3. Run the dev server

```bash
npm run dev
```

4. Open http://localhost:3000

## Environment Variables

Required variables used by the app (set in `.env.local` for local, and in Vercel Project Settings for Production/Preview):

- AUTH_SECRET
- AUTH_GITHUB_ID
- AUTH_GITHUB_SECRET
- AUTH_GOOGLE_ID
- AUTH_GOOGLE_SECRET
- MONGODB_URI
- MONGODB_DB

Notes:

- On Vercel, `AUTH_URL` / `NEXTAUTH_URL` is usually inferred. If needed, set it to your production URL.
- Never commit `.env*` files. They are ignored by `.gitignore`.

## OAuth Redirect URLs

After your first deploy to Vercel, configure these in your providers:

- GitHub Authorization callback URL:

  - `https://<your-app>.vercel.app/api/auth/callback/github`

- Google Authorized redirect URI:
  - `https://<your-app>.vercel.app/api/auth/callback/google`

If you want auth to work on Preview deployments, you can also add the preview URL patterns later (e.g., `https://<your-app>-git-branch-<user>.vercel.app/...`).

## MongoDB Setup

1. Create a cluster in MongoDB Atlas
2. Create a database user and get the connection string
3. Add Network Access rules (allow Vercel to connect; during development you can allow 0.0.0.0/0)
4. Set `MONGODB_URI` and `MONGODB_DB`

## Project Structure (high level)

```
app/
  (root)/
    page.tsx
    layout.tsx
    loading.tsx
  api/
    auth/[...nextauth]/route.ts
    image-proxy/route.ts
components/
  ui/
lib/
  models/
  mongodb.ts
  utils.ts
```

## Scripts

```bash
npm run dev     # Start dev server (Turbopack)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Lint
```

## Deployment (Vercel)

1. Create a new project in Vercel and import this repository
2. Add the Environment Variables from above in Vercel Project Settings
3. Deploy
4. Configure OAuth callback URLs to your production domain

## Troubleshooting

- 500 on auth callback: Check env variables and exact redirect URLs
- MongoDB connect errors: Verify URI/DB name and Atlas network access rules
- Remote images failing: Confirm the target URLs are reachable and correct

## Security

- Do not commit `.env*` files
- Rotate secrets if they were ever exposed publicly (create new OAuth secrets, change DB password, and update `AUTH_SECRET`)

## License

This project is licensed under the MIT License. See `LICENSE` for details.
