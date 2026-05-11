import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { ProductForm } from "@/components/admin/ProductForm"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

type Props = { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "Editar Produto" }

export default async function EditarProdutoPage({ params }: Props) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  })
  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar: {product.name}</h1>
        <Link href="/admin/produtos" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          ← Voltar
        </Link>
      </div>
      <ProductForm product={product} />
    </div>
  )
}
