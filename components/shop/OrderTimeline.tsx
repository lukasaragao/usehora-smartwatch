import { CheckCircle2, Circle, CreditCard, Package, Truck, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { key: "PAID", label: "Pago", icon: CreditCard },
  { key: "PREPARING", label: "Preparando", icon: Package },
  { key: "SHIPPED", label: "Enviado", icon: Truck },
  { key: "DELIVERED", label: "Entregue", icon: Home },
] as const

const STEP_ORDER = ["PENDING", "PAID", "PREPARING", "SHIPPED", "DELIVERED"]

function getStepIndex(status: string) {
  return STEP_ORDER.indexOf(status)
}

export function OrderTimeline({ status }: { status: string }) {
  const currentIndex = getStepIndex(status)
  const isCanceled = status === "CANCELED" || status === "REFUNDED"

  return (
    <div className="w-full">
      {isCanceled ? (
        <p className="text-sm text-destructive font-medium">
          {status === "CANCELED" ? "Pedido cancelado" : "Pedido reembolsado"}
        </p>
      ) : (
        <div className="flex items-start gap-0">
          {STEPS.map((step, idx) => {
            const stepIndex = getStepIndex(step.key)
            const isDone = currentIndex >= stepIndex
            const isCurrent = currentIndex === stepIndex
            const isLast = idx === STEPS.length - 1
            const Icon = step.icon

            return (
              <div key={step.key} className="flex items-start flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-full border-2 transition-colors",
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {isDone && !isCurrent ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-1.5 text-xs text-center leading-tight",
                      isDone ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mt-4 transition-colors",
                      currentIndex > stepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
