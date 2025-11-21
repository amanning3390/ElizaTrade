'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, FileText } from 'lucide-react';

export function FeesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const res = await fetch('/api/fees');
      return res.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const stats = data?.stats || {};
  const fees = data?.fees || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction Fees</h1>
        <p className="text-muted-foreground">
          View your transaction fee history and statistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalFees?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.feeCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Fee</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.averageFee?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.1%</div>
            <p className="text-xs text-muted-foreground">Of trade value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee History</CardTitle>
        </CardHeader>
        <CardContent>
          {fees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No fees recorded yet
            </p>
          ) : (
            <div className="space-y-4">
              {fees.map((fee: any) => (
                <div
                  key={fee.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      ${parseFloat(fee.feeAmount).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(fee.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Trade Value: ${parseFloat(fee.tradeValue).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(parseFloat(fee.feePercentage) * 100).toFixed(2)}% fee
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

