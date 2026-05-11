import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadImage } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`

  const result = await uploadImage(dataUri)

  return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
}
