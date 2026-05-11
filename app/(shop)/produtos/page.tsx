import { prisma } from "@/lib/db"
import { ProductCard } from "@/components/shop/ProductCard"
import { ProductFilters } from "@/components/shop/ProductFilters"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"


export const metadata: Metadata = { title: "Produtos" }

type SearchParams = {
  q?: string
  marca?: string
  precoMin?: string
  precoMax?: string
  ordem?: string
  pagina?: string
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.pagina ?? 1))
  const limit = 12

  const where = {
    active: true,
    ...(sp.q && {
      OR: [
        { name: { contains: sp.q, mode: "insensitive" as const } },
        { brand: { contains: sp.q, mode: "insensitive" as const } },
        { description: { contains: sp.q, mode: "insensitive" as const } },
      ],
    }),
    ...(sp.marca && { brand: { equals: sp.marca, mode: "insensitive" as const } }),
    ...(sp.precoMin || sp.precoMax
      ? {
          price: {
            ...(sp.precoMin && { gte: Number(sp.precoMin) }),
            ...(sp.precoMax && { lte: Number(sp.precoMax) }),
          },
        }
      : {}),
  }

  const orderByMap: Record<string, object> = {
    "menor-preco": { price: "asc" },
    "maior-preco": { price: "desc" },
    novos: { createdAt: "desc" },
  }
  const orderBy = orderByMap[sp.ordem ?? ""] ?? { createdAt: "desc" }

  const [products, total, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where: { active: true, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
    }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {sp.q ? `Busca: "${sp.q}"` : "Todos os Produtos"}
        <span className="text-sm font-normal text-muted-foreground ml-2">({total} produtos)</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de filtros */}
        <aside className="w-full lg:w-60 shrink-0">
          <ProductFilters
            brands={brands.map((b) => b.brand!).filter(Boolean)}
            currentFilters={sp}
          />
        </aside>

        {/* Grid de produtos */}
        <div className="flex-1 space-y-6">
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-20">
              Nenhum produto encontrado.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <a
                  key={n}
                  href={`/produtos?${new URLSearchParams({ ...sp, pagina: String(n) })}`}
                  className={`h-8 w-8 flex items-center justify-center rounded text-sm border transition-colors
                    ${n === page ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted"}`}
                >
                  {n}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
