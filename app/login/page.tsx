"use client"

import { useState, useActionState } from "react"
import { signIn } from "next-auth/react"
import { sendOTP } from "@/actions/phone-auth"
import { normalizePhone } from "@/lib/phone-utils"

type Step = "phone" | "otp"
type Tab = "google" | "phone"

const initialState = { error: undefined as string | undefined, sent: false }

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("google")
  const [step, setStep] = useState<Step>("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [verifyError, setVerifyError] = useState("")
  const [loading, setLoading] = useState(false)

  const [sendState, sendAction, sending] = useActionState(sendOTP, initialState)

  if (sendState.sent && step === "phone") setStep("otp")

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setVerifyError("")
    setLoading(true)
    try {
      const res = await signIn("phone-otp", {
        phone: normalizePhone(phone),
        otp,
        redirect: false,
      })
      if (res?.error) {
        setVerifyError("Código incorreto ou expirado.")
      } else {
        window.location.href = "/"
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-8 space-y-6 rounded-lg border bg-card shadow-sm">
        <h1 className="text-2xl font-bold text-center">Entrar</h1>

        {/* Tabs */}
        <div className="flex rounded-md border overflow-hidden text-sm font-medium">
          <button
            type="button"
            onClick={() => setTab("google")}
            className={`flex-1 py-2 transition ${tab === "google" ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => setTab("phone")}
            className={`flex-1 py-2 transition ${tab === "phone" ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
          >
            Celular
          </button>
        </div>

        {tab === "google" && (
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition"
          >
            Continuar com Google
          </button>
        )}

        {tab === "phone" && step === "phone" && (
          <form action={sendAction} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Celular (com DDD)</label>
              <div className="flex rounded-md border overflow-hidden">
                <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm border-r">
                  🇧🇷 +55
                </span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="11 99999-9999"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
                  required
                />
              </div>
            </div>
            {sendState.error && (
              <p className="text-sm text-destructive">{sendState.error}</p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
            >
              {sending ? "Enviando..." : "Enviar código"}
            </button>
          </form>
        )}

        {tab === "phone" && step === "otp" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Código enviado para <strong>{phone}</strong>
            </p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Código de verificação</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-md border px-3 py-2 text-sm text-center tracking-widest outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            {verifyError && (
              <p className="text-sm text-destructive">{verifyError}</p>
            )}
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp("") }}
              className="w-full text-sm text-muted-foreground hover:underline"
            >
              Usar outro número
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
