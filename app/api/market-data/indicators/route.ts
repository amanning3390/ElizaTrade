import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTC';

    // In a real implementation, calculate from price data
    const indicators = {
      rsi: 50 + (Math.random() - 0.5) * 40,
      macd: {
        value: (Math.random() - 0.5) * 1000,
        signal: (Math.random() - 0.5) * 1000,
        histogram: (Math.random() - 0.5) * 500,
      },
      bollinger: {
        upper: 100 + Math.random() * 50,
        middle: 100,
        lower: 50 + Math.random() * 50,
      },
      support: 90 + Math.random() * 10,
      resistance: 110 + Math.random() * 10,
      timestamp: Date.now(),
    };

    return NextResponse.json({ symbol, indicators });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

