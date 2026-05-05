import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

// Edge-compatible config (no Node.js modules — used by middleware)
export const authConfig: NextAuthConfig = {
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname === "/login"

      if (!isLoggedIn && !isAuthPage) {
        return Response.redirect(new URL("/login", nextUrl))
      }
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
  },
}
