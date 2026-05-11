import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderConfirmationEmail(order: {
  orderNumber: string
  user: { email: string; name?: string | null }
  items: { product: { name: string }; quantity: number; unitPrice: any }[]
  total: any
}) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: order.user.email,
    subject: `Pedido ${order.orderNumber} confirmado — UseHora Smartwatch`,
    html: `
      <h1>Olá, ${order.user.name ?? "cliente"}!</h1>
      <p>Seu pedido <strong>${order.orderNumber}</strong> foi confirmado.</p>
      <p>Total: R$ ${Number(order.total).toFixed(2)}</p>
      <p>Acompanhe seus pedidos em <a href="${process.env.NEXT_PUBLIC_URL}/minha-conta/pedidos">Meus Pedidos</a>.</p>
    `,
  })
}

export async function sendOrderStatusEmail(order: {
  orderNumber: string
  user: { email: string; name?: string | null }
  status: string
  trackingCode?: string | null
}) {
  const statusLabels: Record<string, string> = {
    PREPARING: "Em preparação",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: order.user.email,
    subject: `Pedido ${order.orderNumber} — ${statusLabels[order.status] ?? order.status}`,
    html: `
      <h1>Olá, ${order.user.name ?? "cliente"}!</h1>
      <p>Seu pedido <strong>${order.orderNumber}</strong> foi atualizado.</p>
      <p>Status: <strong>${statusLabels[order.status] ?? order.status}</strong></p>
      ${order.trackingCode ? `<p>Código de rastreio: <strong>${order.trackingCode}</strong></p>` : ""}
      <p><a href="${process.env.NEXT_PUBLIC_URL}/minha-conta/pedidos">Ver meus pedidos</a></p>
    `,
  })
}
