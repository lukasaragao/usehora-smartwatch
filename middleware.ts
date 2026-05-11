import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")
  const isAccountRoute = req.nextUrl.pathname.startsWith("/minha-conta")
  const isCheckoutRoute = req.nextUrl.pathname.startsWith("/checkout")

  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === "ADMIN"

  if (isAdminRoute && (!isLoggedIn || !isAdmin)) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if ((isAccountRoute || isCheckoutRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/admin/:path*", "/minha-conta/:path*", "/checkout/:path*"],
}
