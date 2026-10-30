import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItemType = 'DIGITAL_KEY' | 'PHYSICAL_GEAR';

export interface CartItem {
  id: string;
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
  removeItem: (id: string, type?: CartItemType) => void;
  updateQuantity: (id: string, quantity: number, type?: CartItemType) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const identity = (item: Pick<CartItem, 'id' | 'type'>) => item.type + ':' + item.id;
const MAX_CLIENT_QUANTITY = 99;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(i => identity(i) === identity(item));
          if (existing) {
            const nextQuantity = Math.min(existing.quantity + 1, MAX_CLIENT_QUANTITY);
            return {
              items: state.items.map(i => identity(i) === identity(item) ? { ...i, quantity: nextQuantity } : i),
              isOpen: true,
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }], isOpen: true };
        });
      },
      removeItem: (id, type = 'PHYSICAL_GEAR') =>
        set((state) => ({ items: state.items.filter(i => identity(i) !== identity({ id, type })) })),
      updateQuantity: (id, quantity, type = 'PHYSICAL_GEAR') => {
        const normalized = Number.isInteger(quantity) ? Math.max(1, Math.min(quantity, MAX_CLIENT_QUANTITY)) : 1;
        set((state) => ({
          items: state.items.map(i => identity(i) === identity({ id, type }) ? { ...i, quantity: normalized } : i),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'nexus-cart-storage',
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
