"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Minus, Plus, Trash2, ShoppingCart, Package } from "lucide-react"
import { useCart } from "@/hooks/useCart"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const SHIPPING_OPTIONS = [
  { id: "pac", label: "PAC", description: "até 3 dias úteis", price: 15 },
  { id: "sedex", label: "SEDEX", description: "1 dia útil", price: 25 },
]

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()
  const [cep, setCep] = useState("")
  const [shippingResult, setShippingResult] = useState<typeof SHIPPING_OPTIONS | null>(null)
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)
  const [cepLoading, setCepLoading] = useState(false)

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCep(e.target.value.replace(/\D/g, "").slice(0, 8))
  }

  async function calcShipping() {
    if (cep.length !== 8) return
    setCepLoading(true)
    // Simulate short delay, then show fixed options
    await new Promise((r) => setTimeout(r, 300))
    setShippingResult(SHIPPING_OPTIONS)
    setCepLoading(false)
  }

  const shipping = SHIPPING_OPTIONS.find((o) => o.id === selectedShipping)
  const total = totalPrice() + (shipping?.price ?? 0)

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="text-muted-foreground">Adicione produtos para continuar</p>
        <Link href="/produtos" className={cn(buttonVariants({ size: "lg" }))}>
          Ver produtos
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Carrinho de compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 border rounded-lg p-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    Sem imagem
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="flex justify-between gap-2">
                  <Link
                    href={`/produtos/${product.slug}`}
                    className="text-sm font-semibold hover:underline line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <button
                    className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-destructive hover:text-destructive flex-shrink-0")}
                    onClick={() => removeItem(product.id)}
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 border rounded-md">
                    <button
                      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      aria-label="Diminuir"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button
                      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      aria-label="Aumentar"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-base">
                    R$ {(product.price * quantity).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-base">Resumo do pedido</h2>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {totalPrice().toFixed(2).replace(".", ",")}</span>
            </div>

            <Separator />

            {/* CEP / Frete */}
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                Calcular frete
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="00000-000"
                  value={cep}
                  onChange={handleCepChange}
                  className="flex-1"
                  maxLength={8}
                />
                <button
                  className={cn(buttonVariants({ variant: "outline" }))}
                  onClick={calcShipping}
                  disabled={cep.length !== 8 || cepLoading}
                >
                  {cepLoading ? "..." : "OK"}
                </button>
              </div>

              {shippingResult && (
                <div className="space-y-2 mt-2">
                  {shippingResult.map((opt) => (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex items-center justify-between border rounded-md px-3 py-2 cursor-pointer transition-colors",
                        selectedShipping === opt.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          value={opt.id}
                          checked={selectedShipping === opt.id}
                          onChange={() => setSelectedShipping(opt.id)}
                          className="accent-primary"
                        />
                        <div>
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">
                        R$ {opt.price.toFixed(2).replace(".", ",")}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {shipping && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frete ({shipping.label})</span>
                <span>R$ {shipping.price.toFixed(2).replace(".", ",")}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>

            <Link
              href="/checkout"
              className={cn(buttonVariants({ size: "lg" }), "w-full")}
            >
              Finalizar compra
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
