import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { dbConnect } from "./lib/mongodb";
import Author from "./lib/models/Author";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user: { name, email, image }, account, profile }) {
      if (!account || !profile) return false;

      const providerId =
        account.provider === "github" ? profile.id : profile.sub;
      const username =
        account.provider === "github"
          ? (profile as any).login
          : (profile as any).email?.split("@")[0] ||
            name?.toLowerCase().replace(/\s+/g, "");

      await dbConnect();
      // Check existing author by providerId+provider
      const existingUser = await Author.findOne({
        providerId: String(providerId),
        provider: account.provider,
      }).lean();

      if (!existingUser) {
        await Author.create({
          providerId: String(providerId),
          provider: account.provider,
          name,
          username,
          email,
          image,
          bio: (profile as any).bio || "",
        });
      }
      return true;
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        const providerId =
          account.provider === "github" ? profile.id : profile.sub;

        await dbConnect();
        const user = await Author.findOne({
          providerId: String(providerId),
          provider: account.provider,
        })
          .select("_id")
          .lean();

        token.id = user?._id?.toString();
      }
      return token;
    },

    async session({ session, token }) {
      Object.assign(session, { id: token.id });
      return session;
    },
  },
});
