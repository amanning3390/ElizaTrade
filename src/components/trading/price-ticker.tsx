'use client';

import { useSSE } from '@/hooks/use-sse';

export function PriceTicker() {
  const { data } = useSSE('/api/stream');

  if (!data || data.type !== 'price_update') {
    return null;
  }

  const prices = data.data;

  return (
    <div className="flex gap-4 overflow-x-auto border-b pb-2">
      {Object.entries(prices).map(([symbol, priceData]: [string, any]) => (
        <div key={symbol} className="flex items-center gap-2 whitespace-nowrap">
          <span className="font-medium">{symbol}</span>
          <span className="text-sm">${priceData.price.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

