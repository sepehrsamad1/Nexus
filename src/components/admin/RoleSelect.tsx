'use client';

import { updateUserRole } from '@/actions/admin';
import { useState, useTransition } from 'react';

export function RoleSelect({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState(currentRole);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole);
    startTransition(async () => {
      await updateUserRole(userId, newRole);
    });
  };

  return (
    <select 
      value={role} 
      onChange={handleChange}
      disabled={isPending}
      className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded-lg px-2 py-1 outline-none focus:border-indigo-500 disabled:opacity-50"
    >
      <option value="USER">User</option>
      <option value="STREAMER">Streamer</option>
      <option value="EXPERT">Expert</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}
