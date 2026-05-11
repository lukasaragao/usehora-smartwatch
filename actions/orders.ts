"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendOrderStatusEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"

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
