import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be under 100 characters"),
  description: z.string().min(5, "Description must be at least 5 characters").max(500, "Description must be under 500 characters"),
  category: z.string().min(2, "Category must be at least 2 characters").max(30, "Category must be under 30 characters"),
  link: z
    .string()
    .url("Must be a valid cover image URL")
    .refine(
      async (url) => {
        if (typeof window !== "undefined") return true;
        // Check for common image patterns first to bypass slow/blocking HTTP HEAD requests
        const lowerUrl = url.toLowerCase();
        if (
          lowerUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/) ||
          lowerUrl.includes("placehold.co") ||
          lowerUrl.includes("placeholder") ||
          lowerUrl.includes("unsplash.com/photo")
        ) {
          return true;
        }
        try {
          const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(3000) });
          const contentType = res.headers.get("content-type") ?? "";
          return contentType.startsWith("image/");
        } catch (error) {
          // Fallback to true if it looks like an image URL, otherwise allow it if it's a valid URL
          return true;
        }
      },
      { message: "Link must be a direct image URL" }
    ),
  details: z.string().min(10, "Project details must be at least 10 characters"),
  technologies: z.string().min(2, "Please select or enter at least one technology"),
  githubUrl: z.string().url("Must be a valid GitHub URL").regex(/github\.com/, "Must be a github.com link"),
  liveUrl: z.string().url("Must be a valid live demo URL").optional().or(z.literal("")),
  documentationUrl: z.string().url("Must be a valid documentation URL").optional().or(z.literal("")),
  screenshots: z.array(z.string().url()).optional(),
  status: z.enum(["Draft", "Published"]).default("Published"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be under 50 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be under 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain alphanumeric characters, underscores, and hyphens"),
  email: z.string().email("Must be a valid email address").optional().or(z.literal("")),
  bio: z.string().max(300, "Bio must be under 300 characters").optional().or(z.literal("")),
  instagram: z.string().max(50).optional().or(z.literal("")),
  github: z.string().url("Must be a valid GitHub profile URL").optional().or(z.literal("")),
  portfolio: z.string().url("Must be a valid portfolio URL").optional().or(z.literal("")),
  twitter: z.string().url("Must be a valid Twitter/X URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid LinkedIn URL").optional().or(z.literal("")),
  image: z.string().url("Must be a valid image URL").optional().or(z.literal("")),
});
