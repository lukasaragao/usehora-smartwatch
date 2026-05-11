import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./db"
import { authConfig } from "./auth.config"
import { verifyOTP, normalizePhone } from "./otp"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      id: "phone-otp",
      credentials: { phone: {}, otp: {} },
      async authorize(credentials) {
        const phone = normalizePhone(credentials.phone as string)
        const otp = credentials.otp as string

        const result = await verifyOTP(phone, otp)
        if (!result.ok) return null

        let user = await prisma.user.findUnique({ where: { phone } })
        if (!user) {
          const fakeEmail = `phone_${phone.replace("+", "")}@phone.local`
          user = await prisma.user.create({
            data: { phone, email: fakeEmail },
          })
        }
        return user
      },
    }),
  ],
})
