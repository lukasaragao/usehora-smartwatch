import { prisma } from "@/lib/db"

export default async function AdminDashboard() {
  const [totalOrders, totalProducts, totalUsers] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.user.count(),
  ])

  const stats = [
    { label: "Pedidos", value: totalOrders },
    { label: "Produtos ativos", value: totalProducts },
    { label: "Clientes", value: totalUsers },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
