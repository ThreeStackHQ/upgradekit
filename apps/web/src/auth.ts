import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { db, users, eq } from "@upgradekit/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env["GITHUB_CLIENT_ID"]!,
      clientSecret: process.env["GITHUB_CLIENT_SECRET"]!,
    }),
    Google({
      clientId: process.env["GOOGLE_CLIENT_ID"]!,
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"]!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      // Upsert user on first OAuth sign-in
      try {
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(users).values({
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
          });
        } else {
          // Update name/image if changed
          await db
            .update(users)
            .set({
              name: user.name ?? existing[0]?.name,
              image: user.image ?? existing[0]?.image,
            })
            .where(eq(users.email, user.email));
        }
        return true;
      } catch (error) {
        console.error("[Auth] Error upserting user:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        // Fetch DB user to get UUID
        const dbUser = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email))
          .limit(1);

        if (dbUser[0]) {
          token["userId"] = dbUser[0].id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token["userId"]) {
        session.user.id = token["userId"] as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env["AUTH_SECRET"],
});
