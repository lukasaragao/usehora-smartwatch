import "dotenv/config"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../lib/generated/prisma/client"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  // Produtos de exemplo
  const products = [
    {
      slug: "smartwatch-pro-x1",
      name: "SmartWatch Pro X1",
      description: "Smartwatch premium com monitoramento cardíaco contínuo, GPS integrado e bateria de 7 dias.",
      price: 899.9,
      comparePrice: 1199.9,
      stock: 50,
      brand: "UseHora",
      specs: {
        "Tela": "AMOLED 1.4\"",
        "Bateria": "7 dias",
        "GPS": "Sim",
        "Resistência": "5ATM",
        "SO compatível": "Android / iOS",
      },
    },
    {
      slug: "smartwatch-fit-s2",
      name: "SmartWatch Fit S2",
      description: "Perfeito para treinos. Monitora frequência cardíaca, SpO2, passos e calorias.",
      price: 499.9,
      stock: 80,
      brand: "UseHora",
      specs: {
        "Tela": "LCD 1.2\"",
        "Bateria": "5 dias",
        "GPS": "Via smartphone",
        "Resistência": "IP68",
        "SO compatível": "Android / iOS",
      },
    },
    {
      slug: "smartwatch-classic-c3",
      name: "SmartWatch Classic C3",
      description: "Design elegante com notificações inteligentes, pagamento por NFC e pulseira de couro.",
      price: 1299.9,
      comparePrice: 1599.9,
      stock: 30,
      brand: "UseHora",
      specs: {
        "Tela": "AMOLED 1.6\" Redondo",
        "Bateria": "3 dias",
        "NFC": "Sim",
        "Resistência": "3ATM",
        "SO compatível": "Android / iOS",
      },
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    })
  }

  console.log("✅ Seed concluído:", products.length, "produtos criados")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
