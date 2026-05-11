import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

// Edge-safe config (no db/prisma imports)
export const authConfig = {
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdmin = (auth?.user as { role?: string } | undefined)?.role === "ADMIN"
      const path = nextUrl.pathname

      if (path.startsWith("/admin") && (!isLoggedIn || !isAdmin)) return false
      if ((path.startsWith("/minha-conta") || path.startsWith("/checkout")) && !isLoggedIn) return false
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? "CUSTOMER"
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = (token.role as string) ?? "CUSTOMER"
      return session
    },
  },
} satisfies NextAuthConfig
