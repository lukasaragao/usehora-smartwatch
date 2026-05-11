import { redirect } from "next/navigation"
import Link from "next/link"
import { Package } from "lucide-react"
import { auth } from "@/lib/auth"
import { getUserOrders } from "@/actions/orders"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando",
  PAID: "Pago",
  PREPARING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
}

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PAID: "bg-blue-100 text-blue-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELED: "bg-red-100 text-red-700",
  REFUNDED: "bg-orange-100 text-orange-700",
}

export default async function PedidosPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const orders = await getUserOrders()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Package className="h-6 w-6" />
        Meus Pedidos
      </h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <Package className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground text-lg">Você ainda não fez nenhum pedido.</p>
          <Link href="/produtos" className={cn(buttonVariants({ size: "lg" }))}>
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/minha-conta/pedidos/${order.id}`}
              className="block rounded-lg border bg-card p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full font-medium",
                      STATUS_CLASSES[order.status] ?? "bg-gray-100 text-gray-700"
                    )}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <p className="font-semibold">
                    R$ {Number(order.total).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
