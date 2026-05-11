"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function toggleWishlist(productId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  })

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { userId_productId: { userId: session.user.id, productId } },
    })
  } else {
    await prisma.wishlistItem.create({
      data: { userId: session.user.id, productId },
    })
  }

  revalidatePath("/")
}

export async function getWishlist() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
  })
}
