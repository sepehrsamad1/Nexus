import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItemType = 'DIGITAL_KEY' | 'PHYSICAL_GEAR';

export interface CartItem {
  id: string; // Unique ID (could be gameId or productId)
  name: string;
  price: number;
  image: string;
  type: CartItemType;
  quantity: number;
  category?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            // Digital keys usually just 1 per account, but let's allow multiple for gifting, or restrict physical
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }], isOpen: true };
        });
      },
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'nexus-cart-storage',
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);
