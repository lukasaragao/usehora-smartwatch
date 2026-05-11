import { Redis } from "@upstash/redis"

const OTP_TTL = 300 // 5 minutes
const MAX_ATTEMPTS = 5

// In-memory fallback for local dev when Upstash is not configured
const devStore = new Map<string, { value: string; expires: number }>()

function isRedisConfigured() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? ""
  return url.startsWith("https://")
}

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
}

async function storeSet(key: string, value: string, ttl: number) {
  if (isRedisConfigured()) {
    await getRedis().set(key, value, { ex: ttl })
  } else {
    devStore.set(key, { value, expires: Date.now() + ttl * 1000 })
  }
}

async function storeGet(key: string): Promise<string | null> {
  if (isRedisConfigured()) {
    return getRedis().get<string>(key)
  }
  const entry = devStore.get(key)
  if (!entry || entry.expires < Date.now()) { devStore.delete(key); return null }
  return entry.value
}

async function storeDel(key: string) {
  if (isRedisConfigured()) {
    await getRedis().del(key)
  } else {
    devStore.delete(key)
  }
}

async function storeIncr(key: string, ttl: number): Promise<number> {
  if (isRedisConfigured()) {
    const redis = getRedis()
    const n = await redis.incr(key)
    if (n === 1) await redis.expire(key, ttl)
    return n
  }
  const entry = devStore.get(key)
  const current = entry && entry.expires > Date.now() ? Number(entry.value) : 0
  const next = current + 1
  devStore.set(key, { value: String(next), expires: Date.now() + ttl * 1000 })
  return next
}

function otpKey(phone: string) { return `otp:${phone}` }
function attemptsKey(phone: string) { return `otp_attempts:${phone}` }

export async function generateAndSendOTP(phone: string): Promise<void> {
  const code = String(Math.floor(100000 + Math.random() * 900000))
  await storeSet(otpKey(phone), code, OTP_TTL)
  await sendSMS(phone, `Seu código UseHora: ${code}. Válido por 5 minutos.`)
}

export async function verifyOTP(
  phone: string,
  code: string
): Promise<{ ok: boolean; error?: string }> {
  const attempts = await storeIncr(attemptsKey(phone), OTP_TTL)
  if (attempts > MAX_ATTEMPTS) {
    return { ok: false, error: "Muitas tentativas. Solicite um novo código." }
  }

  const stored = await storeGet(otpKey(phone))
  if (!stored) return { ok: false, error: "Código expirado. Solicite um novo." }
  if (stored !== code) return { ok: false, error: "Código incorreto." }

  await storeDel(otpKey(phone))
  await storeDel(attemptsKey(phone))
  return { ok: true }
}

async function sendSMS(to: string, message: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !from) {
    console.log(`[OTP DEV] ${to}: ${message}`)
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
