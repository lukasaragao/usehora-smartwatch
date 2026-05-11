import { Redis } from "@upstash/redis"

const OTP_TTL = 300 // 5 minutes
const MAX_ATTEMPTS = 5

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

function otpKey(phone: string) {
  return `otp:${phone}`
}

function attemptsKey(phone: string) {
  return `otp_attempts:${phone}`
}

export async function generateAndSendOTP(phone: string): Promise<void> {
  const redis = getRedis()
  const code = String(Math.floor(100000 + Math.random() * 900000))

  await redis.set(otpKey(phone), code, { ex: OTP_TTL })

  await sendSMS(phone, `Seu código UseHora: ${code}. Válido por 5 minutos.`)
}

export async function verifyOTP(
  phone: string,
  code: string
): Promise<{ ok: boolean; error?: string }> {
  const redis = getRedis()

  const attempts = await redis.incr(attemptsKey(phone))
  if (attempts === 1) await redis.expire(attemptsKey(phone), OTP_TTL)
  if (attempts > MAX_ATTEMPTS) {
    return { ok: false, error: "Muitas tentativas. Solicite um novo código." }
  }

  const stored = await redis.get<string>(otpKey(phone))
  if (!stored) return { ok: false, error: "Código expirado. Solicite um novo." }
  if (stored !== code) return { ok: false, error: "Código incorreto." }

  await redis.del(otpKey(phone))
  await redis.del(attemptsKey(phone))
  return { ok: true }
}

async function sendSMS(to: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from) {
    // Dev fallback: log to console when Twilio is not configured
    console.log(`[OTP] ${to}: ${message}`)
    return
  }

  const useWhatsApp = from.startsWith("whatsapp:")
  const toFormatted = useWhatsApp ? `whatsapp:${to}` : to

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: toFormatted, From: from, Body: message }),
    }
  )

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Twilio error ${err.code}: ${err.message}`)
  }
}
