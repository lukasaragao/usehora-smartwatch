import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'

  const staticRoutes = ['', '/produtos'].map(route => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    })
    productRoutes = products.map(p => ({
      url: `${base}/produtos/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB unavailable at build time — only static routes included
  }

  return [...staticRoutes, ...productRoutes]
}
