import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  searchParams: Promise<{ pedido?: string }>
}

export default async function CheckoutSucessoPage({ searchParams }: Props) {
  const { pedido } = await searchParams

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center max-w-lg">
      <CheckCircle2 className="h-16 w-16 text-green-500" />
      <h1 className="text-2xl font-bold">Pedido realizado com sucesso!</h1>
      {pedido && (
        <p className="text-muted-foreground">
          Seu número de pedido é: <span className="font-semibold text-foreground">{pedido}</span>
        </p>
      )}
      <p className="text-muted-foreground text-sm">
        Você receberá um e-mail de confirmação em breve. Acompanhe o status do seu pedido em Meus Pedidos.
      </p>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link href="/minha-conta/pedidos" className={cn(buttonVariants({ size: "lg" }))}>
          Meus Pedidos
        </Link>
        <Link href="/produtos" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          Continuar comprando
        </Link>
      </div>
    </div>
  )
}
