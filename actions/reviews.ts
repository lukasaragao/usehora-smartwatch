"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { reviewSchema } from "@/lib/validators/review"
import { z } from "zod"

export async function createReview(input: z.infer<typeof reviewSchema>) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const { orderItemId, rating, comment } = reviewSchema.parse(input)

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: true, review: true },
  })

  if (!orderItem) throw new Error("Item não encontrado")

  if (orderItem.order.userId !== session.user.id) {
    throw new Error("Não autorizado")
  }

  if (orderItem.order.status !== "DELIVERED") {
    throw new Error("Só é possível avaliar após a entrega do pedido")
  }

  if (orderItem.review) {
    throw new Error("Você já avaliou este produto")
  }

  return prisma.review.create({
    data: {
      orderItemId,
      productId: orderItem.productId,
      userId: session.user.id,
      rating,
      comment,
    },
  })
}
