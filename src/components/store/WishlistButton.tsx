'use client';

import { Heart } from 'lucide-react';
import { useWishlist, WishlistItem } from '@/store/useWishlist';
import { cn } from '@/lib/utils';

export function WishlistButton({ item, className }: { item: WishlistItem; className?: string }) {
  const isWishlisted = useWishlist(state => state.isWishlisted(item.id, item.type));
  const toggleItem = useWishlist(state => state.toggleItem);

  return (
    <button
      type="button"
      aria-label={isWishlisted ? 'Remove ' + item.name + ' from wishlist' : 'Add ' + item.name + ' to wishlist'}
      aria-pressed={isWishlisted}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleItem(item);
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-xl border p-2.5 transition-colors',
        isWishlisted
          ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
          : 'border-zinc-700 bg-zinc-950/80 text-zinc-400 hover:border-rose-500/40 hover:text-rose-300',
        className,
      )}
    >
      <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
    </button>
  );
}
