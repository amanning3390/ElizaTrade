'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TradesList() {
  const { data, isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: async () => {
      const res = await fetch('/api/trades');
      return res.json();
    },
  });

  if (isLoading) {
    return <div>Loading trades...</div>;
  }

  const trades = data?.trades || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade History</CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trades yet</p>
        ) : (
          <div className="space-y-4">
            {trades.map((trade: any) => {
              const fee = trade.fee || (trade.metadata as any)?.fee;
              return (
                <div
                  key={trade.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <p className="font-medium">
                      {trade.side.toUpperCase()} {trade.amount} {trade.symbol}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(trade.createdAt).toLocaleString()}
                    </p>
                    {fee && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Fee: ${fee.feeAmount?.toFixed(2) || fee.amount?.toFixed(2) || '0.00'}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${trade.price}</p>
                    <p
                      className={`text-sm ${
                        trade.status === 'executed'
                          ? 'text-green-600'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {trade.status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

