import Link from "next/link"
import { prisma } from "@/lib/db"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/generated/prisma/client"

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

const ALL_STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[]

type Props = {
  searchParams: Promise<{ status?: string }>
}

export default async function AdminPedidosPage({ searchParams }: Props) {
  const sp = await searchParams
  const statusFilter = ALL_STATUSES.includes(sp.status as OrderStatus)
    ? (sp.status as OrderStatus)
    : undefined

  const orders = await prisma.order.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
      </div>

      {/* Filter by status */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={cn(
            buttonVariants({ variant: !statusFilter ? "default" : "outline", size: "sm" })
          )}
        >
          Todos
        </Link>
        {ALL_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pedidos?status=${s}`}
            className={cn(
              buttonVariants({ variant: statusFilter === s ? "default" : "outline", size: "sm" })
            )}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Numero</th>
              <th className="text-left p-3 font-medium">Cliente</th>
              <th className="text-left p-3 font-medium">Data</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Total</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{order.orderNumber}</td>
                  <td className="p-3 text-muted-foreground">{order.user.email}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-0.5 rounded-full font-medium",
                        STATUS_CLASSES[order.status] ?? "bg-gray-100 text-gray-700"
                      )}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="p-3">R$ {Number(order.total).toFixed(2).replace(".", ",")}</td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
