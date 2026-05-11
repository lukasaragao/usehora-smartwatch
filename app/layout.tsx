import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'),
  title: { default: "UseHora Smartwatch", template: "%s | UseHora Smartwatch" },
  description: "Smartwatches premium com os melhores preços. Encontre o smartwatch ideal para você.",
  openGraph: {
    title: "UseHora Smartwatch",
    description: "Smartwatches premium com os melhores preços. Encontre o smartwatch ideal para você.",
    type: "website",
    locale: "pt_BR",
    siteName: "UseHora Smartwatch",
  },
  twitter: {
    card: "summary_large_image",
    title: "UseHora Smartwatch",
    description: "Smartwatches premium com os melhores preços. Encontre o smartwatch ideal para você.",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
