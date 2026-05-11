"use server"

import { generateAndSendOTP, normalizePhone } from "@/lib/otp"

export async function sendOTP(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; sent?: boolean }> {
  const raw = formData.get("phone") as string

  if (!raw) return { error: "Informe o número de celular." }

  const phone = normalizePhone(raw)
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 12 || digits.length > 13) {
    return { error: "Número inválido. Use DDD + número (ex: 11999999999)." }
  }

  try {
    await generateAndSendOTP(phone)
    return { sent: true }
  } catch {
    return { error: "Erro ao enviar o código. Tente novamente." }
  }
}
