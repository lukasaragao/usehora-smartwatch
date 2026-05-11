"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function addToCart(productId: string, quantity = 1) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId: session.user.id, productId, quantity },
  })

  revalidatePath("/")
}

export async function removeFromCart(productId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  await prisma.cartItem.delete({
    where: { userId_productId: { userId: session.user.id, productId } },
  })

  revalidatePath("/")
}

export async function updateCartQuantity(productId: string, quantity: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  if (quantity <= 0) {
    return removeFromCart(productId)
  }

  await prisma.cartItem.update({
    where: { userId_productId: { userId: session.user.id, productId } },
    data: { quantity },
  })

  revalidatePath("/")
}

export async function getCart() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
  })
}
