"use client"

import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { buttonVariants } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/generated/prisma/client"

type Props = {
  product: Pick<Product, "id" | "name" | "price" | "stock" | "slug">
  className?: string
}

export function AddToCartButton({ product, className }: Props) {
  const addItem = useCart((s) => s.addItem)

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      slug: product.slug,
    })
    toast.success(`${product.name} adicionado ao carrinho`)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={product.stock === 0}
      className={cn(buttonVariants({ size: "lg" }), "gap-2", className)}
    >
      <ShoppingCart className="h-5 w-5" />
      {product.stock === 0 ? "Fora de estoque" : "Adicionar ao carrinho"}
    </button>
  )
}
