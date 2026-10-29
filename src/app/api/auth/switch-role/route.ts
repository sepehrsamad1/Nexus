import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { roleSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = roleSchema.safeParse(body?.role);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid demo role' }, { status: 400 });

    const cookieStore = await cookies();
    cookieStore.set('nexus_demo_role', parsed.data, {
      path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    });
    return NextResponse.json({ success: true, role: parsed.data });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
