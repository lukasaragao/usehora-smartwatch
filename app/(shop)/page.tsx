import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { prisma } from "@/lib/db"
import { ProductCard } from "@/components/shop/ProductCard"

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 8,
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-muted/40 py-20 px-4">
        <div className="container mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Smartwatches <span className="text-primary">Premium</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Monitore sua saúde, receba notificações e expresse seu estilo com os melhores smartwatches do mercado.
          </p>
          <Link href="/produtos" className={buttonVariants({ size: "lg" })}>
            Ver todos os produtos
          </Link>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">Mais Vendidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
