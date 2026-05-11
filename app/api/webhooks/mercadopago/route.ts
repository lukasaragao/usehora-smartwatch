import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { prisma } from "@/lib/db"
import { sendOrderConfirmationEmail } from "@/lib/email"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  const body = await req.json()

  if (body.type === "payment") {
    const payment = new Payment(client)
    const data = await payment.get({ id: body.data.id })

    if (data.status === "approved") {
      const order = await prisma.order.update({
        where: { id: data.external_reference! },
        data: {
          status: "PAID",
          paymentId: String(data.id),
        },
        include: { user: true, items: { include: { product: true } } },
      })

      await sendOrderConfirmationEmail(order)
    }
  }

  return NextResponse.json({ received: true })
}
