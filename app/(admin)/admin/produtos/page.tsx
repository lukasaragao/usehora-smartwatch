import { getProducts } from "@/actions/products"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"


export default async function AdminProdutosPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link href="/admin/produtos/novo" className={buttonVariants()}>
          + Novo Produto
        </Link>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium">Preço</th>
              <th className="text-left p-3 font-medium">Estoque</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">R$ {Number(p.price).toFixed(2).replace(".", ",")}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/produtos/${p.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
