import { create } from "zustand"
import { persist } from "zustand/middleware"

type WishlistStore = {
  ids: string[]
  toggle: (productId: string) => void
  has: (productId: string) => boolean
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],

      toggle: (productId) => {
        set((state) =>
          state.ids.includes(productId)
            ? { ids: state.ids.filter((id) => id !== productId) }
            : { ids: [...state.ids, productId] }
        )
      },

      has: (productId) => get().ids.includes(productId),
    }),
    { name: "usehora-wishlist" }
  )
)
