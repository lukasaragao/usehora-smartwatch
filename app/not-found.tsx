import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
      <p className="text-8xl font-black text-muted-foreground/20">404</p>
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">A página que você procura não existe ou foi removida.</p>
      <Link href="/" className={cn(buttonVariants())}>Voltar ao início</Link>
    </div>
  )
}
