import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols')?.split(',') || [
      'BTC',
      'ETH',
      'SOL',
    ];

    // In a real implementation, fetch from CoinGecko, CoinMarketCap, or exchange APIs
    const prices: Record<string, any> = {};

    for (const symbol of symbols) {
      prices[symbol] = {
        price: Math.random() * 100000, // Mock price
        change24h: (Math.random() - 0.5) * 10,
        volume: Math.random() * 1000000000,
        timestamp: Date.now(),
      };
    }

    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

