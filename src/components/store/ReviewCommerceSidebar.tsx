import prisma from '@/lib/prisma';
import { AddToCartButton } from './AddToCartButton';
import { ShoppingBag, Key, Zap } from 'lucide-react';
import { safeJsonParse } from '@/lib/utils';
import Link from 'next/link';

interface ReviewCommerceSidebarProps {
  gameId: string;
  authorId?: string; // To fetch gear used by this specific streamer
}

export async function ReviewCommerceSidebar({ gameId, authorId }: ReviewCommerceSidebarProps) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  
  // Fetch gear recommended by this streamer, or related to this game
  const gear = await prisma.product.findMany({
    where: {
      OR: [
        { recommendedByStreamerId: authorId },
        { relatedGameId: gameId }
      ]
    },
    take: 2
  });

  if (!game && gear.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 sticky top-24">
      {/* Buy Game Key */}
      {game && game.digitalPrice > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
            <Key className="w-4 h-4" /> Instant Digital Key
          </div>
          <img src={game.coverImage} alt={game.title} className="w-full h-32 object-cover rounded-lg mb-4 opacity-80" />
          <h3 className="font-bold text-white text-lg mb-1">{game.title}</h3>
          <p className="text-2xl font-mono font-black text-indigo-400 mb-4">${game.digitalPrice.toFixed(2)}</p>
          <AddToCartButton 
            id={game.id}
            name={`${game.title} (Digital Key)`}
            price={game.digitalPrice}
            image={game.coverImage}
            type="DIGITAL_KEY"
            category="GAME_KEY"
            fullWidth
          />
        </div>
      )}

      {/* Streamer Gear Cross-Sell */}
      {gear.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">
            <Zap className="w-4 h-4" /> Streamer's Gear Setup
          </div>
          
          <div className="space-y-4">
            {gear.map(product => (
              <div key={product.id} className="flex flex-col gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <Link href={`/store/${product.slug}`} className="font-bold text-sm text-white hover:text-indigo-400 transition-colors line-clamp-1">
                  {product.name}
                </Link>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-zinc-400 text-sm">${product.price.toFixed(2)}</span>
                  <AddToCartButton 
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image="https://via.placeholder.com/150/18181b/ffffff?text=GEAR"
                    type="PHYSICAL_GEAR"
                    category={product.category}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
