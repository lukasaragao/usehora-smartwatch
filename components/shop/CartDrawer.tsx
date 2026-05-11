"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) closeCart() }}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-5 w-5" />
            Carrinho ({items.length})
          </SheetTitle>
        </SheetHeader>

        <Separator />

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 px-4 py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Link
              href="/produtos"
              className={cn(buttonVariants({ variant: "outline" }))}
              onClick={closeCart}
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <p className="text-sm font-medium leading-tight line-clamp-2">{product.name}</p>
                      <p className="text-sm font-semibold mt-0.5">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 border rounded-md">
                        <button
                          className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }))}
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm">{quantity}</span>
                        <button
                          className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }))}
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }), "text-destructive hover:text-destructive")}
                        onClick={() => removeItem(product.id)}
                        aria-label="Remover item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <SheetFooter className="px-4 pb-4 pt-3 gap-3">
              <div className="flex justify-between text-sm font-medium w-full">
                <span>Subtotal</span>
                <span>R$ {totalPrice().toFixed(2).replace(".", ",")}</span>
              </div>

              <Link
                href="/checkout"
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
                onClick={closeCart}
              >
                Ir para o Checkout
              </Link>

              <Link
                href="/carrinho"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
                onClick={closeCart}
              >
                Ver carrinho completo
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
