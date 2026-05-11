import { ProductForm } from "@/components/admin/ProductForm"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Novo Produto" }

export default function NovoProdutoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Novo Produto</h1>
      <ProductForm />
    </div>
  )
}
