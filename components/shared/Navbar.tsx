"use client"

import Link from "next/link"
import { ShoppingCart, Heart, User, Watch, Menu, X } from "lucide-react"
import { useState } from "react"
import { buttonVariants } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CartDrawer } from "@/components/shop/CartDrawer"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const totalItems = useCart((s) => s.totalItems)
  const openCart = useCart((s) => s.openCart)

  const links = [
    { href: "/produtos", label: "Produtos" },
    { href: "/produtos?marca=usehora", label: "UseHora" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Watch className="h-6 w-6" />
          <span>UseHora</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Ações */}
        <div className="flex items-center gap-1">
          <Link href="/minha-conta/favoritos" aria-label="Favoritos" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
            <Heart className="h-5 w-5" />
          </Link>

          <button
            onClick={openCart}
            aria-label="Carrinho"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems() > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {totalItems()}
              </Badge>
            )}
          </button>
          <CartDrawer />

          <Link href="/minha-conta/pedidos" aria-label="Minha Conta" className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
            <User className="h-5 w-5" />
          </Link>

          {/* Hamburger mobile */}
          <button
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "lg:hidden")}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav className="lg:hidden border-t px-4 py-3 flex flex-col gap-3 bg-background">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium py-1"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
