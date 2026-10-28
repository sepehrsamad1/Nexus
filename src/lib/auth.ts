import { cookies } from 'next/headers';

// Mock Auth System for Instant Testing
// In a real app, this would be Auth.js/NextAuth or Clerk
export type Role = 'USER' | 'STREAMER' | 'EXPERT' | 'ADMIN';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
}

export const DEMO_USERS: Record<Role, SessionUser> = {
  USER: { id: "usr_demo123", name: "GamerPro99", email: "user@nexus.gg", role: "USER", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1" },
  STREAMER: { id: "str_demo123", name: "NinjaPlays", email: "streamer@nexus.gg", role: "STREAMER", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=streamer1" },
  EXPERT: { id: "exp_demo123", name: "IGN_Reviewer", email: "critic@nexus.gg", role: "EXPERT", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=expert1" },
  ADMIN: { id: "adm_demo123", name: "System Admin", email: "admin@nexus.gg", role: "ADMIN", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin1" },
};

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const cookieStore = await cookies();
  const currentRole = cookieStore.get('nexus_demo_role')?.value as Role;
  
  if (currentRole && DEMO_USERS[currentRole]) {
    return { user: DEMO_USERS[currentRole] };
  }
  
  return { user: DEMO_USERS.USER }; // Default to USER
}
