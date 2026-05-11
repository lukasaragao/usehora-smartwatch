import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product, ProductImage } from "@/lib/generated/prisma/client"

type Props = {
  product: Product & { images: ProductImage[] }
}

export function ProductCard({ product }: Props) {
  const hasDiscount = product.comparePrice && Number(product.comparePrice) > Number(product.price)
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100)
    : null

  return (
    <Link href={`/produtos/${product.slug}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow group">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt ?? product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Sem imagem
            </div>
          )}
          {discountPct && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
              -{discountPct}%
            </Badge>
          )}
        </div>
        <CardContent className="p-4 space-y-1">
          {product.brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand}</p>
          )}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">
              R$ {Number(product.price).toFixed(2).replace(".", ",")}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                R$ {Number(product.comparePrice).toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
