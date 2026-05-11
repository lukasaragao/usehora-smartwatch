"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendOrderStatusEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"
import type { AddressInput } from "@/lib/validators/order"

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (role !== "ADMIN") throw new Error("Não autorizado")
  return session
}

export async function updateOrderStatus(orderId: string, status: string, trackingCode?: string) {
  await requireAdmin()

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any, ...(trackingCode && { trackingCode }) },
    include: { user: true },
  })

  await sendOrderStatusEmail({ ...order, status, trackingCode })

  revalidatePath("/admin/pedidos")
  revalidatePath(`/admin/pedidos/${orderId}`)
  revalidatePath(`/minha-conta/pedidos/${orderId}`)
  return order
}

export async function getUserOrders() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: { include: { images: { take: 1 } } }, review: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function createOrder(input: {
  items: { productId: string; quantity: number; unitPrice: number }[]
  shippingAddress: AddressInput
  shipping: number
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const subtotal = input.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const total = subtotal + input.shipping

  // Generate sequential order number
  const year = new Date().getFullYear()
  const prefix = `SW-${year}-`
  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  })

  let seq = 1
  if (lastOrder) {
    const parts = lastOrder.orderNumber.split("-")
    const last = parseInt(parts[parts.length - 1] ?? "0", 10)
    seq = isNaN(last) ? 1 : last + 1
  }

  const orderNumber = `${prefix}${String(seq).padStart(4, "0")}`

  // Decrement stock and create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return tx.order.create({
      data: {
        orderNumber,
        userId: session.user!.id!,
        subtotal,
        shipping: input.shipping,
        total,
        shippingAddress: input.shippingAddress as any,
        items: {
          create: input.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    })
  })

  revalidatePath("/minha-conta/pedidos")
  return order
}

export async function getOrderById(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { include: { images: { take: 1 } } }, review: true } } },
  })

  if (!order) throw new Error("Pedido não encontrado")

  const role = (session?.user as { role?: string } | undefined)?.role
  if (order.userId !== session.user.id && role !== "ADMIN") {
    throw new Error("Não autorizado")
  }

  return order
}
