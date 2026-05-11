"use client"

import { useRouter } from "next/navigation"
import { ReviewForm } from "@/components/shop/ReviewForm"

export function ReviewModal({
  orderItemId,
  productName,
  orderId,
}: {
  orderItemId: string
  productName: string
  orderId: string
}) {
  const router = useRouter()

  function handleClose() {
    router.push(`/minha-conta/pedidos/${orderId}`)
  }

  return (
    <div className="rounded-md border bg-muted/30 p-4">
      <h3 className="font-semibold mb-3">Avaliar produto</h3>
      <ReviewForm
        orderItemId={orderItemId}
        productName={productName}
        onClose={handleClose}
      />
    </div>
  )
}
