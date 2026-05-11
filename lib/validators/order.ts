import { z } from "zod"

export const addressSchema = z.object({
  recipient: z.string().min(3),
  zipCode: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  street: z.string().min(3),
  number: z.string().min(1),
  complement: z.string().optional(),
  district: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2, "UF deve ter 2 letras"),
})

export type AddressInput = z.infer<typeof addressSchema>
