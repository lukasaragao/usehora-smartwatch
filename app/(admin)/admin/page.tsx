import Link from "next/link"
import { prisma } from "@/lib/db"
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

export default async function AdminDashboard() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [monthOrders, allOrders, totalCustomers, lowStock, recentOrders] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { notIn: ["CANCELED", "REFUNDED"] },
      },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELED", "REFUNDED"] } },
      _sum: { total: true },
      _count: { id: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.findMany({
      where: { active: true, stock: { lt: 5 } },
      select: { id: true, name: true, stock: true },
      orderBy: { stock: "asc" },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    }),
  ])

  const monthRevenue = Number(monthOrders._sum.total ?? 0)
  const monthCount = monthOrders._count.id
  const totalRevenue = Number(allOrders._sum.total ?? 0)
  const totalCount = allOrders._count.id
  const avgTicket = totalCount > 0 ? totalRevenue / totalCount : 0

  const metrics = [
    {
      label: "Receita do mes",
      value: `R$ ${monthRevenue.toFixed(2).replace(".", ",")}`,
    },
    {
      label: "Pedidos no mes",
      value: monthCount,
    },
    {
      label: "Ticket medio",
      value: `R$ ${avgTicket.toFixed(2).replace(".", ",")}`,
    },
    {
      label: "Clientes",
      value: totalCustomers,
    },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-lg border bg-card overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Ultimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-xs text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Numero</th>
                <th className="text-left p-3 font-medium">Cliente</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Total</th>
                <th className="text-left p-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    Nenhum pedido.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <Link href={`/admin/pedidos/${order.id}`} className="text-primary hover:underline font-medium">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground truncate max-w-[150px]">
                      {order.user.name ?? order.user.email}
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
                    <td className="p-3 text-right font-medium">
                      R$ {Number(order.total).toFixed(2).replace(".", ",")}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Low stock */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Estoque baixo</h2>
            <Link href="/admin/produtos" className="text-xs text-primary hover:underline">
              Ver produtos
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Nenhum produto com estoque critico.</p>
          ) : (
            <div className="divide-y">
              {lowStock.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/produtos/${product.id}`}
                    className="text-sm font-medium truncate hover:underline"
                  >
                    {product.name}
                  </Link>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-semibold shrink-0",
                      product.stock === 0
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    )}
                  >
                    {product.stock} un.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
