import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Package } from "lucide-react"
import { prisma } from "@/lib/db"
import { OrderStatusForm } from "@/components/admin/OrderStatusForm"
import { OrderTimeline } from "@/components/shop/OrderTimeline"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"


type Props = { params: Promise<{ id: string }> }

export default async function AdminPedidoDetalhePage({ params }: Props) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      items: {
        include: {
          product: { include: { images: { take: 1 } } },
        },
      },
    },
  })

  if (!order) notFound()

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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedido {order.orderNumber}</h1>
        <Link href="/admin/pedidos" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          ← Voltar
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update status */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold">Atualizar pedido</h2>
          <OrderStatusForm
            orderId={order.id}
            currentStatus={order.status}
            currentTrackingCode={order.trackingCode}
          />
        </div>

        {/* Order info */}
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h2 className="font-semibold">Informacoes</h2>
          <div className="text-sm space-y-1.5">
            <p>
              <span className="text-muted-foreground">Cliente: </span>
              {order.user.name ?? order.user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Email: </span>
              {order.user.email}
            </p>
            <p>
              <span className="text-muted-foreground">Data: </span>
              {new Date(order.createdAt).toLocaleString("pt-BR")}
            </p>
            {order.trackingCode && (
              <p>
                <span className="text-muted-foreground">Rastreio: </span>
                <strong>{order.trackingCode}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-lg border bg-card p-5">
        <h2 className="font-semibold mb-4">Progresso</h2>
        <OrderTimeline status={order.status} />
      </div>

      {/* Items */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Itens</h2>
        </div>
        <div className="divide-y">
          {order.items.map((item) => {
            const img = item.product.images[0]
            return (
              <div key={item.id} className="p-4 flex gap-4 items-center">
                <div className="relative h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0">
                  {img ? (
                    <Image
                      src={img.url}
                      alt={img.alt ?? item.product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-5 w-5 text-muted-foreground" />
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
  )
}
