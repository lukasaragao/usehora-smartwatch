"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { productSchema, type ProductInput } from "@/lib/validators/product"
import { revalidatePath } from "next/cache"

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

async function requireAdmin() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") throw new Error("Não autorizado")
  return session
}

export async function createProduct(input: ProductInput & { imageUrls?: string[] }) {
  await requireAdmin()
  const data = productSchema.parse(input)

  const product = await prisma.product.create({
    data: {
      ...data,
      slug: data.slug || slugify(data.name),
      images: input.imageUrls?.length
        ? { create: input.imageUrls.map((url, i) => ({ url, position: i })) }
        : undefined,
    },
  })

  revalidatePath("/admin/produtos")
  revalidatePath("/produtos")
  return product
}

export async function updateProduct(id: string, input: Partial<ProductInput> & { imageUrls?: string[] }) {
  await requireAdmin()

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...input,
      updatedAt: new Date(),
    },
  })

  revalidatePath("/admin/produtos")
  revalidatePath(`/produtos/${product.slug}`)
  return product
}

export async function deactivateProduct(id: string) {
  await requireAdmin()
  await prisma.product.update({ where: { id }, data: { active: false } })
  revalidatePath("/admin/produtos")
}

export async function getProducts(params?: {
  search?: string
  active?: boolean
  page?: number
  limit?: number
}) {
  const { search, active, page = 1, limit = 20 } = params ?? {}

  return prisma.product.findMany({
    where: {
      ...(active !== undefined && { active }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  })
}
