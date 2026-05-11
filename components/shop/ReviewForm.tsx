"use client"

import { useState, useTransition } from "react"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createReview } from "@/actions/reviews"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function ReviewForm({
  orderItemId,
  productName,
  onClose,
}: {
  orderItemId: string
  productName: string
  onClose: () => void
}) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Selecione uma nota de 1 a 5 estrelas.")
      return
    }

    startTransition(async () => {
      try {
        await createReview({ orderItemId, rating, comment: comment || undefined })
        toast.success("Avaliação enviada com sucesso!")
        router.refresh()
        onClose()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao enviar avaliação.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-1">Avaliando: <strong>{productName}</strong></p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
              aria-label={`${star} estrela${star > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "h-7 w-7 transition-colors",
                  star <= (hovered || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="text-sm font-medium">
          Comentário (opcional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte sua experiência com o produto..."
          className="mt-1.5"
          rows={3}
          maxLength={1000}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || rating === 0}>
          {isPending ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </div>
    </form>
  )
}
