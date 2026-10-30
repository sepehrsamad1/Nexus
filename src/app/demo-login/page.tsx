'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Video, PencilLine, UserRound } from 'lucide-react';

const roles = [
  { id: 'USER', title: 'Regular User', description: 'Browse, review, comment, vote, wishlist, cart and checkout.', icon: UserRound },
  { id: 'STREAMER', title: 'Demo Creator', description: 'Creator profile and creator-platform capabilities.', icon: Video },
  { id: 'EXPERT', title: 'Demo Expert', description: 'Expert review persona for the scoring model.', icon: PencilLine },
  { id: 'ADMIN', title: 'Platform Admin', description: 'Admin dashboard, moderation and demo maintenance.', icon: ShieldCheck },
] as const;

export default function DemoLoginPage() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function signIn(role: string) {
    setPending(role);
    setError('');
    try {
      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Could not create the demo session.');
      router.push(role === 'ADMIN' ? '/admin' : '/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the demo session.');
      setPending(null);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Nexus University Demo</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Choose a demo account</h1>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">
            This is simulated authentication for the Nexus prototype. Each browser keeps its own demo session cookie,
            so you can demonstrate an admin and a normal user at the same time.
          </p>
        </div>

        {error && <div role="alert" className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-red-200">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-2">
          {roles.map(({ id, title, description, icon: Icon }) => (
            <button
              key={id}
              type="button"
              disabled={pending !== null}
              onClick={() => signIn(id)}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-wait disabled:opacity-60"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                  <Icon className="h-6 w-6 text-cyan-400" />
                </span>
                {pending === id && <span className="text-sm text-cyan-300">Signing in…</span>}
              </div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm text-amber-100/80">
          <strong className="text-amber-200">Presentation note:</strong> this is intentionally a prototype auth system,
          not production authentication. No real passwords, payments, or patient/customer data are used.
        </div>

        <a href="/" className="mx-auto mt-8 text-sm text-zinc-500 underline-offset-4 hover:text-white hover:underline">
          Back to Nexus
        </a>
      </div>
    </main>
  );
}
