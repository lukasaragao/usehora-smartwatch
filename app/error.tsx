"use client"
import { useEffect } from "react"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
      <h1 className="text-2xl font-bold">Algo deu errado</h1>
      <p className="text-muted-foreground">Ocorreu um erro inesperado. Tente novamente.</p>
      <div className="flex gap-3">
        <button onClick={reset} className={cn(buttonVariants())}>Tentar novamente</button>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>Voltar ao início</Link>
      </div>
    </div>
  )
}
