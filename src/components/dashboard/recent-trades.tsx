'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RecentTrades() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-trades'],
    queryFn: async () => {
      const res = await fetch('/api/trades?limit=5');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const trades = data?.trades || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <p className="text-sm text-muted-foreground">No trades yet</p>
        ) : (
          <div className="space-y-4">
            {trades.map((trade: any) => (
              <div
                key={trade.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="font-medium">
                    {trade.side.toUpperCase()} {trade.symbol}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(trade.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${trade.price}</p>
                  <p className="text-sm text-muted-foreground">
                    {trade.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

