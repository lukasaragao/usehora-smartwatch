"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { X, Plus, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createProduct, updateProduct } from "@/actions/products"
import type { Product, ProductImage } from "@/lib/generated/prisma/client"

type Props = {
  product?: Product & { images: ProductImage[] }
}

export function ProductForm({ product }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [images, setImages] = useState<string[]>(product?.images.map((i) => i.url) ?? [])
  const [uploading, setUploading] = useState(false)
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    product?.specs
      ? Object.entries(product.specs as Record<string, string>).map(([key, value]) => ({ key, value }))
      : []
  )

  // Gera slug a partir do nome
  function slugify(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData()
          fd.append("file", file)
          const res = await fetch("/api/upload", { method: "POST", body: fd })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          return data.url as string
        })
      )
      setImages((prev) => [...prev, ...urls])
    } catch {
      toast.error("Erro ao fazer upload das imagens")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const name = fd.get("name") as string
    const input = {
      name,
      slug: (fd.get("slug") as string) || slugify(name),
      description: fd.get("description") as string,
      price: Number(fd.get("price")),
      comparePrice: fd.get("comparePrice") ? Number(fd.get("comparePrice")) : undefined,
      stock: Number(fd.get("stock")),
      brand: (fd.get("brand") as string) || undefined,
      active: fd.get("active") === "on",
      specs: specs.length > 0
        ? Object.fromEntries(specs.map((s) => [s.key, s.value]))
        : undefined,
      imageUrls: images,
    }

    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, input)
          toast.success("Produto atualizado!")
        } else {
          await createProduct(input)
          toast.success("Produto criado!")
        }
        router.push("/admin/produtos")
      } catch (err: any) {
        toast.error(err.message ?? "Erro ao salvar produto")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Nome + Slug */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" required defaultValue={product?.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" placeholder="gerado automaticamente" defaultValue={product?.slug} />
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea id="description" name="description" required rows={4} defaultValue={product?.description} />
      </div>

      {/* Preço + Preço "de" + Estoque */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input id="price" name="price" type="number" step="0.01" required defaultValue={product ? Number(product.price) : ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="comparePrice">Preço "de" (R$)</Label>
          <Input id="comparePrice" name="comparePrice" type="number" step="0.01" defaultValue={product?.comparePrice ? Number(product.comparePrice) : ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="stock">Estoque *</Label>
          <Input id="stock" name="stock" type="number" min="0" required defaultValue={product?.stock ?? 0} />
        </div>
      </div>

      {/* Marca + Ativo */}
      <div className="grid grid-cols-2 gap-4 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="brand">Marca</Label>
          <Input id="brand" name="brand" defaultValue={product?.brand ?? ""} />
        </div>
        <div className="flex items-center gap-2 pb-1">
          <Checkbox id="active" name="active" defaultChecked={product?.active ?? true} />
          <Label htmlFor="active">Produto ativo</Label>
        </div>
      </div>

      {/* Imagens */}
      <div className="space-y-2">
        <Label>Imagens</Label>
        <div className="flex flex-wrap gap-3">
          {images.map((url, i) => (
            <div key={i} className="relative w-20 h-20 rounded overflow-hidden border">
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className={cn(
            "w-20 h-20 rounded border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors text-muted-foreground",
            uploading && "opacity-50 pointer-events-none"
          )}>
            {uploading ? <span className="text-xs">...</span> : <><Upload className="h-5 w-5 mb-1" /><span className="text-xs">Upload</span></>}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
      </div>

      {/* Especificações */}
      <div className="space-y-2">
        <Label>Especificações técnicas</Label>
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                placeholder="Chave (ex: Bateria)"
                value={spec.key}
                onChange={(e) => setSpecs((prev) => prev.map((s, j) => j === i ? { ...s, key: e.target.value } : s))}
                className="flex-1"
              />
              <Input
                placeholder="Valor (ex: 7 dias)"
                value={spec.value}
                onChange={(e) => setSpecs((prev) => prev.map((s, j) => j === i ? { ...s, value: e.target.value } : s))}
                className="flex-1"
              />
              <button type="button" onClick={() => setSpecs((prev) => prev.filter((_, j) => j !== i))}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" /> Adicionar especificação
          </button>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || uploading}
          className={cn(buttonVariants(), (pending || uploading) && "opacity-70")}
        >
          {pending ? "Salvando..." : product ? "Salvar alterações" : "Criar produto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className={buttonVariants({ variant: "outline" })}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
