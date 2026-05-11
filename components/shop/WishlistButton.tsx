"use client"

import { Heart } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useWishlist } from "@/hooks/useWishlist"
import { cn } from "@/lib/utils"

export function WishlistButton({ productId }: { productId: string }) {
  const { toggle, has } = useWishlist()
  const saved = has(productId)

  return (
    <button
      onClick={() => toggle(productId)}
      aria-label={saved ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(buttonVariants({ variant: "outline", size: "icon" }), "shrink-0")}
    >
      <Heart className={cn("h-5 w-5", saved && "fill-red-500 text-red-500")} />
    </button>
  )
}
