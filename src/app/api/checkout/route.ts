import { NextResponse } from 'next/server';
import { fulfillMockOrder, CommerceValidationError } from '@/actions/order';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await fulfillMockOrder(body);
    return NextResponse.json({ simulated: true, orderId: result.orderId, total: result.totalAmount });
  } catch (error) {
    if (error instanceof CommerceValidationError) {
      const status = error.message === 'Unauthorized' ? 401 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error('Checkout failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Checkout could not be completed.' }, { status: 500 });
  }
}