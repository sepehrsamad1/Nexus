'use client';

import { useState } from 'react';
import { Key, Copy, Check } from 'lucide-react';

export function RevealKeyButton({ gameKey }: { gameKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(gameKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!revealed) {
    return (
      <button 
        onClick={() => setRevealed(true)}
        className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 flex items-center gap-2 transition-colors"
      >
        <Key className="w-4 h-4" /> Reveal Activation Key
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-emerald-400 text-sm font-bold tracking-widest select-all">
        {gameKey}
      </div>
      <button 
        onClick={handleCopy}
        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
