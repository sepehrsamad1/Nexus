import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  type: 'PHYSICAL_GEAR' | 'DIGITAL_KEY';
  category?: string;
  href: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string, type?: WishlistItem['type']) => void;
  toggleItem: (item: WishlistItem) => void;
  isWishlisted: (id: string, type?: WishlistItem['type']) => boolean;
  clearWishlist: () => void;
}

const identity = (item: Pick<WishlistItem, 'id' | 'type'>) => item.type + ':' + item.id;

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) =>
          state.items.some(existing => identity(existing) === identity(item))
            ? state
            : { items: [...state.items, item] },
        ),
      removeItem: (id, type = 'PHYSICAL_GEAR') =>
        set((state) => ({
          items: state.items.filter(item => identity(item) !== identity({ id, type })),
        })),
      toggleItem: (item) =>
        set((state) => {
          const key = identity(item);
          const exists = state.items.some(existing => identity(existing) === key);
          return { items: exists ? state.items.filter(existing => identity(existing) !== key) : [...state.items, item] };
        }),
      isWishlisted: (id, type = 'PHYSICAL_GEAR') =>
        get().items.some(item => identity(item) === identity({ id, type })),
      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'nexus-wishlist-storage' },
  ),
);
