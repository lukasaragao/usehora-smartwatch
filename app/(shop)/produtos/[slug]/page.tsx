import { notFound } from "next/navigation"
import { prisma } from "@/lib/db"
import { ProductGallery } from "@/components/shop/ProductGallery"
import { StarRating } from "@/components/shop/StarRating"
import { ProductCard } from "@/components/shop/ProductCard"
import { AddToCartButton } from "@/components/shop/AddToCartButton"
import { WishlistButton } from "@/components/shop/WishlistButton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) return {}
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  }
}

export const revalidate = 60

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      reviews: {
        where: { approved: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  })

  if (!product) notFound()

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  const hasDiscount =
    product.comparePrice && Number(product.comparePrice) > Number(product.price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null

  // Produtos relacionados
  const related = await prisma.product.findMany({
    where: { active: true, brand: product.brand, id: { not: product.id } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    take: 4,
  })

  const specs = product.specs as Record<string, string> | null

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Produto principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Galeria */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Informações */}
        <div className="space-y-5">
          {product.brand && (
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              {product.brand}
            </p>
          )}

          <h1 className="text-3xl font-bold">{product.name}</h1>

          {/* Avaliações */}
          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating value={avgRating} size="md" />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ({product.reviews.length} avaliações)
              </span>
            </div>
          )}

          {/* Preço */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold">
              R$ {Number(product.price).toFixed(2).replace(".", ",")}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  R$ {Number(product.comparePrice).toFixed(2).replace(".", ",")}
                </span>
                <Badge className="bg-red-500 hover:bg-red-500">-{discountPct}%</Badge>
              </>
            )}
          </div>

          {/* Estoque */}
          <p className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {product.stock > 5
              ? "Em estoque"
              : product.stock > 0
              ? `Apenas ${product.stock} unidades`
              : "Fora de estoque"}
          </p>

          {/* Botões */}
          <div className="flex gap-3">
            <AddToCartButton product={product} className="flex-1" />
            <WishlistButton productId={product.id} />
          </div>

          <Separator />

          {/* Descrição */}
          <div>
            <h2 className="font-semibold mb-2">Descrição</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          {/* Especificações */}
          {specs && Object.keys(specs).length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Especificações</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {Object.entries(specs).map(([key, val]) => (
                    <tr key={key}>
                      <td className="py-1.5 text-muted-foreground pr-4 w-1/2">{key}</td>
                      <td className="py-1.5 font-medium">{String(val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Avaliações */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          Avaliações{product.reviews.length > 0 && ` (${product.reviews.length})`}
        </h2>
        {product.reviews.length === 0 ? (
          <p className="text-muted-foreground">Este produto ainda não possui avaliações.</p>
        ) : (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{review.user.name ?? "Cliente"}</span>
                  <StarRating value={review.rating} />
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Produtos relacionados */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Produtos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
