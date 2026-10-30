'use client';

import { recalculateDemoScores } from '@/actions/admin';
import { useState, useTransition } from 'react';

export function DemoMaintenance() {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const recalculate = () => {
    if (!window.confirm('Recalculate all demo game scores from the current review data? No users, products, orders, or comments will be deleted.')) return;
    startTransition(async () => {
      try {
        const result = await recalculateDemoScores('CONFIRM');
        setMessage(`Recalculated ${result.count} demo game score records.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to recalculate scores.');
      }
    });
  };

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
      <p className="text-xs font-black uppercase tracking-widest text-indigo-300">Prototype maintenance</p>
      <h2 className="mt-2 text-xl font-bold text-white">Deterministic demo score refresh</h2>
      <p className="mt-2 text-sm text-zinc-400">Safely recomputes Nexus scores from the existing review graph. The full destructive seed remains CLI-only and is never exposed as a casual web action.</p>
      <button type="button" onClick={recalculate} disabled={isPending} className="mt-4 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-400 disabled:opacity-50">
        {isPending ? 'Recalculating…' : 'Recalculate demo scores'}
      </button>
      {message && <p className="mt-3 text-xs text-zinc-400">{message}</p>}
    </div>
  );
}
