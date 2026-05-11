import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRating({
  value,
  max = 5,
  size = "sm",
}: {
  value: number
  max?: number
  size?: "sm" | "md"
}) {
  const sz = size === "sm" ? "h-4 w-4" : "h-5 w-5"
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(sz, i < Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")}
        />
      ))}
    </div>
  )
}
