import { MercadoPagoConfig, Preference } from "mercadopago"

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export async function createPreference(order: {
  id: string
  orderNumber: string
  items: { name: string; quantity: number; unitPrice: number }[]
  total: number
  buyerEmail: string
}) {
  const preference = new Preference(client)

  return preference.create({
    body: {
      external_reference: order.id,
      items: order.items.map((item, i) => ({
        id: String(i + 1),
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        currency_id: "BRL",
      })),
      payer: { email: order.buyerEmail },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_URL}/checkout/sucesso?pedido=${order.orderNumber}`,
        failure: `${process.env.NEXT_PUBLIC_URL}/checkout/falha`,
        pending: `${process.env.NEXT_PUBLIC_URL}/checkout/pendente`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhooks/mercadopago`,
    },
  })
}
