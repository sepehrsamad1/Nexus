'use client';

import { useCart, CartItemType } from '@/store/useCart';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  id: string;
  name: string;
  price: number;
  image: string;
  type: CartItemType;
  category?: string;
  className?: string;
  fullWidth?: boolean;
}

export function AddToCartButton({ id, name, price, image, type, category, className, fullWidth }: AddToCartButtonProps) {
  const addItem = useCart(state => state.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id, name, price, image, type, category });
  };

  return (
    <button 
      onClick={handleAdd}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-colors text-sm",
        fullWidth ? "w-full" : "",
        className
      )}
    >
      <ShoppingCart className="w-4 h-4" />
      <span>${price.toFixed(2)} - Add to Cart</span>
    </button>
  );
}
