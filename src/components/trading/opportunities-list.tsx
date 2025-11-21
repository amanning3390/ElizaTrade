'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OpportunitiesList() {
  const { data, isLoading } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const res = await fetch('/api/opportunities');
      return res.json();
    },
  });

  if (isLoading) {
    return <div>Loading opportunities...</div>;
  }

  const opportunities = data?.opportunities || [];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {opportunities.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No opportunities found. Start scanning to find trading opportunities.
            </p>
          </CardContent>
        </Card>
      ) : (
        opportunities.map((opp: any) => (
          <Card key={opp.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{opp.symbol}</span>
                <span className="text-lg font-bold">
                  {parseFloat(opp.score).toFixed(2)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{opp.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Detected: {new Date(opp.detectedAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

