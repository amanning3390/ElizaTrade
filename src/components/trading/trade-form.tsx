'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function TradeForm() {
  const [symbol, setSymbol] = useState('BTC');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch current price for fee estimation
  useQuery({
    queryKey: ['price', symbol],
    queryFn: async () => {
      const res = await fetch(`/api/market-data/prices?symbols=${symbol}`);
      const data = await res.json();
      return data.prices[symbol];
    },
    enabled: !!symbol && !!amount,
    onSuccess: (data) => {
      if (data?.price) {
        setEstimatedPrice(data.price);
      }
    },
  });

  // Calculate estimated fee
  const estimatedFee = estimatedPrice && amount
    ? Math.max((parseFloat(amount) * estimatedPrice) * 0.001, 0.01) // 0.1% fee, $0.01 minimum
    : null;

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await fetch('/api/agents');
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (tradeData: any) => {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData),
      });
      if (!res.ok) throw new Error('Failed to execute trade');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      setAmount('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeAgent = agents?.agents?.find((a: any) => a.status === 'active');
    if (!activeAgent) {
      alert('No active agent. Please start an agent first.');
      return;
    }

    mutation.mutate({
      agentId: activeAgent.id,
      symbol,
      side,
      amount: parseFloat(amount),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execute Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Side</label>
            <select
              value={side}
              onChange={(e) => setSide(e.target.value as 'buy' | 'sell')}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              step="0.00000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
              required
            />
          </div>
          {estimatedFee && amount && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Trade Value:</span>
                <span className="font-medium">
                  ${(parseFloat(amount) * (estimatedPrice || 0)).toFixed(2)}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Transaction Fee (0.1%):</span>
                <span className="font-medium text-primary">
                  ${estimatedFee.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Executing...' : 'Execute Trade'}
          </Button>
          {mutation.isError && (
            <p className="text-sm text-destructive">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Failed to execute trade'}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

