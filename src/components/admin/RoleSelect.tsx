'use client';

import { updateUserRole } from '@/actions/admin';
import { useState, useTransition } from 'react';

export function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const requestRole = (newRole: string) => {
    if (newRole === role) return;
    setPendingRole(newRole);
    setMessage('');
  };

  const confirm = () => {
    if (!pendingRole) return;
    const nextRole = pendingRole;
    startTransition(async () => {
      try {
        await updateUserRole(userId, nextRole);
        setRole(nextRole);
        setMessage('Role updated.');
        setPendingRole(null);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Unable to update role.');
        setPendingRole(null);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <select value={pendingRole ?? role} onChange={(e) => requestRole(e.target.value)} disabled={isPending} aria-label="User role" className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-2 py-1 outline-none focus:border-indigo-500 disabled:opacity-50">
        <option value="USER">User</option><option value="STREAMER">Streamer</option><option value="EXPERT">Expert</option><option value="ADMIN">Admin</option>
      </select>
      {pendingRole && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-right">
          <p className="text-[11px] text-amber-200 mb-2">Confirm changing this demo user to {pendingRole}?</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPendingRole(null)} className="text-[11px] text-zinc-400 hover:text-white">Cancel</button>
            <button type="button" onClick={confirm} disabled={isPending} className="rounded bg-indigo-500 px-2 py-1 text-[11px] font-bold text-white disabled:opacity-50">{isPending ? 'Saving…' : 'Confirm'}</button>
          </div>
        </div>
      )}
      {message && <p className="text-[11px] text-zinc-500">{message}</p>}
    </div>
  );
}
