'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/useCart';
import { useEffect, useState } from 'react';

export function CartIcon() {
  const { items, setIsOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <button 
      onClick={() => setIsOpen(true)}
      className="p-2 text-zinc-400 hover:text-white relative transition-colors"
    >
      <ShoppingCart className="w-5 h-5" />
      {mounted && itemCount > 0 && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1 border border-zinc-950">
          {itemCount}
        </span>
      )}
    </button>
  );
}
