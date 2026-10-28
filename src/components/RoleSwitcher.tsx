'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Video, PencilLine, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Role = 'USER' | 'STREAMER' | 'EXPERT' | 'ADMIN';

const ROLES: { id: Role; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'USER', label: 'Regular User', icon: User, color: 'text-slate-400' },
  { id: 'STREAMER', label: 'Verified Streamer', icon: Video, color: 'text-purple-400' },
  { id: 'EXPERT', label: 'Expert Critic', icon: PencilLine, color: 'text-emerald-400' },
  { id: 'ADMIN', label: 'Platform Admin', icon: ShieldCheck, color: 'text-rose-400' },
];

export function RoleSwitcher({ currentRole = 'USER' }: { currentRole?: Role }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const activeRole = ROLES.find(r => r.id === currentRole) || ROLES[0];

  const switchRole = async (role: Role) => {
    setIsOpen(false);
    await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-zinc-900/50 hover:bg-zinc-800 transition-colors text-sm font-medium",
          isPending ? "opacity-50" : "",
          "border-zinc-800"
        )}
      >
        <activeRole.icon className={cn("w-4 h-4", activeRole.color)} />
        <span className="hidden sm:inline-block">{activeRole.label}</span>
        <ChevronDown className="w-3 h-3 text-zinc-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden z-50">
          <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-950/50">
            Switch Demo Persona
          </div>
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => switchRole(r.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-zinc-800 transition-colors",
                currentRole === r.id ? "bg-zinc-800/50" : ""
              )}
            >
              <r.icon className={cn("w-4 h-4", r.color)} />
              <span className={currentRole === r.id ? "text-white font-medium" : "text-zinc-400"}>
                {r.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
