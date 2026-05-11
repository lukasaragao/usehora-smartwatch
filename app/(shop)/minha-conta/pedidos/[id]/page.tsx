import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ExternalLink, Package } from "lucide-react"
import { auth } from "@/lib/auth"
import { getOrderById } from "@/actions/orders"
import { OrderTimeline } from "@/components/shop/OrderTimeline"
import { ReviewModal } from "@/components/shop/ReviewModal"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"


const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pago",
  PREPARING: "Em preparação",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
}

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ avaliar?: string }>
}

export default async function PedidoDetalhePage({ params, searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params
  const sp = await searchParams

  let order
  try {
    order = await getOrderById(id)
  } catch {
    notFound()
  }

  const address = order.shippingAddress as {
    recipient?: string
    street?: string
    number?: string
    complement?: string
    district?: string
    city?: string
    state?: string
    zipCode?: string
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Pedido {order.orderNumber}
        </h1>
        <Link href="/minha-conta/pedidos" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          ← Meus Pedidos
        </Link>
      </div>

      <div className="space-y-6">
        {/* Status info */}
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <span className="text-sm font-medium">{STATUS_LABELS[order.status] ?? order.status}</span>
          </div>
          <OrderTimeline status={order.status} />
          {order.trackingCode && (
            <div className="flex items-center gap-2 pt-1">
              <p className="text-sm text-muted-foreground">
                Código de rastreio: <strong>{order.trackingCode}</strong>
              </p>
              <Link
                href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.trackingCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-1 h-7 text-xs")}
              >
                Rastrear <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Itens do pedido</h2>
          </div>
          <div className="divide-y">
            {order.items.map((item) => {
              const img = item.product.images[0]
              const canReview = order.status === "DELIVERED" && !item.review
              const isReviewing = sp.avaliar === item.id

              return (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                      {img ? (
                        <Image
                          src={img.url}
                          alt={img.alt ?? item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity}x R$ {Number(item.unitPrice).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <p className="font-semibold shrink-0">
                      R$ {(Number(item.unitPrice) * item.quantity).toFixed(2).replace(".", ",")}
                    </p>
                  </div>

                  {item.review && (
                    <p className="text-xs text-green-600 font-medium">Avaliacao enviada ({item.review.rating}/5)</p>
                  )}

                  {canReview && !isReviewing && (
                    <div>
                      <Link
                        href={`/minha-conta/pedidos/${order.id}?avaliar=${item.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
                      >
                        Avaliar produto
                      </Link>
                    </div>
                  )}

                  {isReviewing && (
                    <ReviewModal
                      orderItemId={item.id}
                      productName={item.product.name}
                      orderId={order.id}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Address */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold mb-3">Endereco de entrega</h2>
          <address className="not-italic text-sm text-muted-foreground space-y-0.5">
            {address.recipient && <p className="font-medium text-foreground">{address.recipient}</p>}
            <p>
              {address.street}{address.number ? `, ${address.number}` : ""}
              {address.complement ? ` — ${address.complement}` : ""}
            </p>
            <p>{address.district}</p>
            <p>
              {address.city}
              {address.state ? ` — ${address.state}` : ""}
            </p>
            {address.zipCode && <p>CEP: {address.zipCode}</p>}
          </address>
        </div>

        {/* Totals */}
        <div className="rounded-lg border bg-card p-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>R$ {Number(order.subtotal).toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frete</span>
            <span>
              {Number(order.shipping) === 0
                ? "Gratis"
                : `R$ ${Number(order.shipping).toFixed(2).replace(".", ",")}`}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t pt-2">
            <span>Total</span>
            <span>R$ {Number(order.total).toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
