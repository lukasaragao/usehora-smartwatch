import { signIn } from "@/lib/auth"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-8 space-y-4 rounded-lg border bg-card shadow-sm">
        <h1 className="text-2xl font-bold text-center">Entrar</h1>
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition"
          >
            Continuar com Google
          </button>
        </form>
      </div>
    </div>
  )
}
