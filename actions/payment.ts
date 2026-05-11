"use server"

import { auth } from "@/lib/auth"
import { createPreference } from "@/lib/mercadopago"

export async function createPaymentPreference(order: {
  id: string
  orderNumber: string
  items: { name: string; quantity: number; unitPrice: number }[]
  total: number
  buyerEmail: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Não autenticado")

  const preference = await createPreference(order)
  return { initPoint: preference.init_point ?? null }
}
