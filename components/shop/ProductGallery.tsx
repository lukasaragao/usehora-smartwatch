"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"
import type { ProductImage } from "@/lib/generated/prisma/client"

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
        Sem imagem
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Imagem principal */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <Image
          src={images[active].url}
          alt={images[active].alt ?? name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative w-16 h-16 rounded overflow-hidden border-2 transition-colors",
                i === active ? "border-primary" : "border-transparent hover:border-muted-foreground"
              )}
            >
              <Image src={img.url} alt={img.alt ?? name} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
