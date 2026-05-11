"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { updateOrderStatus } from "@/actions/orders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALL_STATUSES = [
  { value: "PENDING", label: "Aguardando" },
  { value: "PAID", label: "Pago" },
  { value: "PREPARING", label: "Preparando" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
]

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentTrackingCode,
}: {
  orderId: string
  currentStatus: string
  currentTrackingCode?: string | null
}) {
  const [status, setStatus] = useState(currentStatus)
  const [trackingCode, setTrackingCode] = useState(currentTrackingCode ?? "")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, status, trackingCode || undefined)
        toast.success("Pedido atualizado com sucesso!")
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao atualizar pedido.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v ?? currentStatus)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="trackingCode">Codigo de rastreio (opcional)</Label>
        <Input
          id="trackingCode"
          value={trackingCode}
          onChange={(e) => setTrackingCode(e.target.value)}
          placeholder="Ex: BR123456789BR"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Salvando..." : "Salvar alteracoes"}
      </Button>
    </form>
  )
}
