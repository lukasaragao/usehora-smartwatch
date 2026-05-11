import Link from "next/link"
import { XCircle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CheckoutFalhaPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center max-w-lg">
      <XCircle className="h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-bold">Pagamento não concluído</h1>
      <p className="text-muted-foreground">
        Houve um problema ao processar seu pagamento. Seu pedido não foi confirmado.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }))}>
          Tentar novamente
        </Link>
        <Link href="/carrinho" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Ver carrinho
        </Link>
      </div>
    </div>
  )
}
