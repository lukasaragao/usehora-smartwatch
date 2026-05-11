"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useCart } from "@/hooks/useCart"
import { createOrder } from "@/actions/orders"
import { createPaymentPreference } from "@/actions/payment"
import { addressSchema, type AddressInput } from "@/lib/validators/order"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { CheckCircle2, ChevronRight } from "lucide-react"

const STEPS = ["Endereço", "Frete", "Revisão", "Pagamento"]

const SHIPPING_OPTIONS = [
  { id: "pac", label: "PAC", description: "até 3 dias úteis", price: 15 },
  { id: "sedex", label: "SEDEX", description: "1 dia útil", price: 25 },
]

type AddressForm = {
  recipient: string
  zipCode: string
  street: string
  number: string
  complement: string
  district: string
  city: string
  state: string
}

const EMPTY_ADDRESS: AddressForm = {
  recipient: "",
  zipCode: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                i < step
                  ? "bg-primary border-primary text-primary-foreground"
                  : i === step
                  ? "border-primary text-primary"
                  : "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "text-xs hidden sm:block",
                i <= step ? "text-foreground font-medium" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2 transition-colors",
                i < step ? "bg-primary" : "bg-muted-foreground/20"
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState<AddressForm>(EMPTY_ADDRESS)
  const [errors, setErrors] = useState<Partial<Record<keyof AddressForm, string>>>({})
  const [cepLoading, setCepLoading] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState<string>("pac")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const shipping = SHIPPING_OPTIONS.find((o) => o.id === selectedShipping) ?? SHIPPING_OPTIONS[0]!
  const subtotal = totalPrice()
  const total = subtotal + shipping.price

  function handleAddressChange(field: keyof AddressForm, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleCepBlur() {
    const raw = address.zipCode.replace(/\D/g, "")
    if (raw.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setAddress((prev) => ({
          ...prev,
          street: data.logradouro ?? prev.street,
          district: data.bairro ?? prev.district,
          city: data.localidade ?? prev.city,
          state: data.uf ?? prev.state,
        }))
      }
    } catch {
      // silently fail - user fills manually
    } finally {
      setCepLoading(false)
    }
  }

  function validateAddress(): boolean {
    const result = addressSchema.safeParse({
      ...address,
      zipCode: address.zipCode.replace(/\D/g, ""),
    })
    if (result.success) {
      setErrors({})
      return true
    }
    const newErrors: typeof errors = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof AddressForm
      if (field) newErrors[field] = issue.message
    }
    setErrors(newErrors)
    return false
  }

  function goToShipping() {
    if (validateAddress()) setStep(1)
  }

  function goToReview() {
    setStep(2)
  }

  async function handlePlaceOrder() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const parsedAddress: AddressInput = {
        recipient: address.recipient,
        zipCode: address.zipCode.replace(/\D/g, ""),
        street: address.street,
        number: address.number,
        complement: address.complement || undefined,
        district: address.district,
        city: address.city,
        state: address.state,
      }

      const order = await createOrder({
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
          unitPrice: product.price,
        })),
        shippingAddress: parsedAddress,
        shipping: shipping.price,
      })

      const preference = await createPaymentPreference({
        id: order.id,
        orderNumber: order.orderNumber,
        items: items.map(({ product, quantity }) => ({
          name: product.name,
          quantity,
          unitPrice: product.price,
        })),
        total,
        buyerEmail: order.user.email ?? "",
      })

      clearCart()

      const initPoint = preference.initPoint
      if (initPoint) {
        window.location.href = initPoint
      } else {
        router.push(`/checkout/sucesso?pedido=${order.orderNumber}`)
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao criar pedido.")
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
        <a href="/produtos" className={cn(buttonVariants({ size: "lg" }))}>
          Ver produtos
        </a>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <ProgressBar step={step} />

      {/* Step 0: Address */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Endereço de entrega</h2>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Destinatário" error={errors.recipient}>
              <Input
                placeholder="Nome completo"
                value={address.recipient}
                onChange={(e) => handleAddressChange("recipient", e.target.value)}
              />
            </Field>

            <Field label="CEP" error={errors.zipCode}>
              <div className="flex gap-2">
                <Input
                  placeholder="00000000"
                  value={address.zipCode}
                  onChange={(e) => handleAddressChange("zipCode", e.target.value.replace(/\D/g, "").slice(0, 8))}
                  onBlur={handleCepBlur}
                  maxLength={8}
                  className="max-w-[160px]"
                />
                {cepLoading && <span className="text-sm text-muted-foreground self-center">Buscando...</span>}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Field label="Rua" error={errors.street}>
                  <Input
                    placeholder="Rua, Avenida..."
                    value={address.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Número" error={errors.number}>
                <Input
                  placeholder="123"
                  value={address.number}
                  onChange={(e) => handleAddressChange("number", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Complemento (opcional)">
              <Input
                placeholder="Apto, Bloco..."
                value={address.complement}
                onChange={(e) => handleAddressChange("complement", e.target.value)}
              />
            </Field>

            <Field label="Bairro" error={errors.district}>
              <Input
                placeholder="Bairro"
                value={address.district}
                onChange={(e) => handleAddressChange("district", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Cidade" error={errors.city}>
                <Input
                  placeholder="Cidade"
                  value={address.city}
                  onChange={(e) => handleAddressChange("city", e.target.value)}
                />
              </Field>
              <Field label="UF" error={errors.state}>
                <Input
                  placeholder="SP"
                  value={address.state}
                  onChange={(e) => handleAddressChange("state", e.target.value.toUpperCase().slice(0, 2))}
                  maxLength={2}
                />
              </Field>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}
              onClick={goToShipping}
            >
              Próximo <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Shipping */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Escolha o frete</h2>
          <p className="text-sm text-muted-foreground">
            Entregando para: {address.street}, {address.number} — {address.city}/{address.state}
          </p>

          <div className="space-y-3">
            {SHIPPING_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  "flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer transition-colors",
                  selectedShipping === opt.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="checkout-shipping"
                    value={opt.id}
                    checked={selectedShipping === opt.id}
                    onChange={() => setSelectedShipping(opt.id)}
                    className="accent-primary"
                  />
                  <div>
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.description}</p>
                  </div>
                </div>
                <span className="font-bold">R$ {opt.price.toFixed(2).replace(".", ",")}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button className={cn(buttonVariants({ variant: "outline" }))} onClick={() => setStep(0)}>
              Voltar
            </button>
            <button
              className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}
              onClick={goToReview}
            >
              Próximo <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Revisão do pedido</h2>

          {/* Items */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Itens</h3>
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-md overflow-hidden border bg-muted flex-shrink-0">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="48px" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">-</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground">Qtd: {quantity}</p>
                </div>
                <span className="text-sm font-semibold">
                  R$ {(product.price * quantity).toFixed(2).replace(".", ",")}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Address */}
          <div className="space-y-1">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Endereço</h3>
            <p className="text-sm">{address.recipient}</p>
            <p className="text-sm">
              {address.street}, {address.number}
              {address.complement ? `, ${address.complement}` : ""}
            </p>
            <p className="text-sm">
              {address.district} — {address.city}/{address.state}
            </p>
            <p className="text-sm">CEP: {address.zipCode}</p>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frete ({shipping.label})</span>
              <span>R$ {shipping.price.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>

          {submitError && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button className={cn(buttonVariants({ variant: "outline" }))} onClick={() => setStep(1)}>
              Voltar
            </button>
            <button
              className={cn(buttonVariants({ size: "lg" }))}
              onClick={handlePlaceOrder}
              disabled={submitting}
            >
              {submitting ? "Processando..." : "Finalizar Compra"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
