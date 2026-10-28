import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { role } = await request.json();
    if (!['USER', 'STREAMER', 'EXPERT', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set('nexus_demo_role', role, { path: '/' });
    
    return NextResponse.json({ success: true, role });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
