"use client"

import { useRouter, usePathname } from "next/navigation"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
  brands: string[]
  currentFilters: {
    q?: string
    marca?: string
    precoMin?: string
    precoMax?: string
    ordem?: string
  }
}

export function ProductFilters({ brands, currentFilters }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  const push = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(
        Object.entries(currentFilters).filter(([, v]) => v) as [string, string][]
      )
      if (value) params.set(key, value)
      else params.delete(key)
      params.delete("pagina")
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, currentFilters]
  )

  return (
    <div className="space-y-5">
      {/* Busca */}
      <div className="space-y-1.5">
        <Label>Buscar</Label>
        <Input
          placeholder="Nome ou marca..."
          defaultValue={currentFilters.q}
          onKeyDown={(e) => {
            if (e.key === "Enter") push("q", (e.target as HTMLInputElement).value)
          }}
          onBlur={(e) => push("q", e.target.value)}
        />
      </div>

      {/* Marca */}
      {brands.length > 0 && (
        <div className="space-y-1.5">
          <Label>Marca</Label>
          <Select
            value={currentFilters.marca ?? "todas"}
            onValueChange={(v) => push("marca", v == null || v === "todas" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as marcas</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Faixa de preço */}
      <div className="space-y-1.5">
        <Label>Faixa de preço</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Mín"
            defaultValue={currentFilters.precoMin}
            className="w-full"
            onBlur={(e) => push("precoMin", e.target.value)}
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Máx"
            defaultValue={currentFilters.precoMax}
            className="w-full"
            onBlur={(e) => push("precoMax", e.target.value)}
          />
        </div>
      </div>

      {/* Ordenação */}
      <div className="space-y-1.5">
        <Label>Ordenar por</Label>
        <Select
          value={currentFilters.ordem ?? "novos"}
          onValueChange={(v) => push("ordem", v ?? "novos")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="novos">Mais novos</SelectItem>
            <SelectItem value="menor-preco">Menor preço</SelectItem>
            <SelectItem value="maior-preco">Maior preço</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Limpar */}
      {Object.values(currentFilters).some(Boolean) && (
        <button
          onClick={() => router.push(pathname)}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
