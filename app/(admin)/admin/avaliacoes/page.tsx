import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { StarRating } from "@/components/shop/StarRating"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function AdminAvaliacoesPage() {
  const reviews = await prisma.review.findMany({
    include: {
      product: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  async function toggleApproval(id: string, approved: boolean) {
    "use server"
    await prisma.review.update({ where: { id }, data: { approved } })
    revalidatePath("/admin/avaliacoes")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Avaliacoes</h1>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Produto</th>
              <th className="text-left p-3 font-medium">Usuario</th>
              <th className="text-left p-3 font-medium">Nota</th>
              <th className="text-left p-3 font-medium">Comentario</th>
              <th className="text-left p-3 font-medium">Data</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  Nenhuma avaliacao encontrada.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="hover:bg-muted/30">
                  <td className="p-3 font-medium">{review.product.name}</td>
                  <td className="p-3 text-muted-foreground">
                    {review.user.name ?? review.user.email}
                  </td>
                  <td className="p-3">
                    <StarRating value={review.rating} />
                  </td>
                  <td className="p-3 max-w-xs">
                    <p className="truncate text-muted-foreground">
                      {review.comment ?? "—"}
                    </p>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-0.5 rounded-full font-medium",
                        review.approved
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {review.approved ? "Aprovado" : "Reprovado"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <form
                      action={async () => {
                        "use server"
                        await toggleApproval(review.id, !review.approved)
                      }}
                    >
                      <button
                        type="submit"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          review.approved ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"
                        )}
                      >
                        {review.approved ? "Reprovar" : "Aprovar"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
