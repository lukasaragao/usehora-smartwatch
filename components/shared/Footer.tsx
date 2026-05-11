import Link from "next/link"
import { Watch } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Watch className="h-5 w-5" />
          UseHora Smartwatch
        </Link>

        <nav className="flex gap-4">
          <Link href="/produtos" className="hover:text-foreground transition-colors">Produtos</Link>
          <Link href="/minha-conta/pedidos" className="hover:text-foreground transition-colors">Meus Pedidos</Link>
        </nav>

        <p>© {new Date().getFullYear()} UseHora. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
