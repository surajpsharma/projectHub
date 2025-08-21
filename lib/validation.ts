import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(5).max(500),
  category: z.string().min(3).max(20),
  // Avoid cross-origin network validation in the browser to prevent CORS issues
  link: z
    .string()
    .url()
    .refine(
      async (url) => {
        // If running in the browser, skip network validation. UI preview handles it.
        if (typeof window !== "undefined") return true;
        // On the server, validate with a HEAD request
        try {
          const res = await fetch(url, { method: "HEAD" });
          const contentType = res.headers.get("content-type") ?? "";
          return contentType.startsWith("image/");
        } catch (error) {
          return false;
        }
      },
      { message: "Link must be a direct image URL" }
    ),
  details: z.string().min(10),
});
