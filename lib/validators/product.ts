import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug inválido"),
  description: z.string().min(10, "Descrição muito curta"),
  price: z.number().positive("Preço deve ser positivo"),
  comparePrice: z.number().positive().optional(),
  stock: z.number().int().min(0),
  brand: z.string().optional(),
  active: z.boolean().default(true),
  specs: z.record(z.string(), z.unknown()).optional(),
})

export type ProductInput = z.infer<typeof productSchema>
