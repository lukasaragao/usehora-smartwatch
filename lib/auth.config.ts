import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

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
    session({ session, user }) {
      session.user.id = user.id
      session.user.role = (user as { role?: string }).role ?? "CUSTOMER"
      return session
    },
  },
} satisfies NextAuthConfig
