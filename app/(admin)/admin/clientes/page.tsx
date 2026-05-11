import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"


export default async function AdminClientesPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { total: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Cadastro</th>
              <th className="text-right p-3 font-medium">Pedidos</th>
              <th className="text-right p-3 font-medium">LTV</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const ltv = user.orders.reduce((sum, o) => sum + Number(o.total), 0)
                return (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{user.name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{user.email}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3 text-right">{user.orders.length}</td>
                    <td className="p-3 text-right font-medium">
                      R$ {ltv.toFixed(2).replace(".", ",")}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
