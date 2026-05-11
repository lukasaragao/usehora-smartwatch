import { redirect } from "next/navigation"
import Link from "next/link"
import { Heart } from "lucide-react"
import { auth } from "@/lib/auth"
import { getWishlist } from "@/actions/wishlist"
import { ProductCard } from "@/components/shop/ProductCard"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function FavoritosPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const wishlist = await getWishlist()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Heart className="h-6 w-6" />
        Meus favoritos
      </h1>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <Heart className="h-16 w-16 text-muted-foreground" />
          <p className="text-muted-foreground text-lg">Você ainda não adicionou produtos aos favoritos.</p>
          <Link href="/produtos" className={cn(buttonVariants({ size: "lg" }))}>
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(({ product }) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
