'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, FileText, Send } from 'lucide-react';

export function FeesPage() {
  const queryClient = useQueryClient();
  const [transferring, setTransferring] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const res = await fetch('/api/fees');
      return res.json();
    },
  });

  const transferMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/fees/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch: true }),
      });
      if (!res.ok) throw new Error('Failed to transfer fees');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      setTransferring(false);
    },
    onError: () => {
      setTransferring(false);
    },
  });

  const handleBatchTransfer = () => {
    if (confirm('Transfer all collected fees to treasury wallet?')) {
      setTransferring(true);
      transferMutation.mutate();
    }
  };

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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fee History</CardTitle>
          {data?.fees?.some((f: any) => f.status === 'collected') && (
            <Button
              onClick={handleBatchTransfer}
              disabled={transferring || transferMutation.isPending}
              size="sm"
            >
              <Send className="mr-2 h-4 w-4" />
              {transferring || transferMutation.isPending
                ? 'Transferring...'
                : 'Transfer to Treasury'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {transferMutation.isError && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {transferMutation.error instanceof Error
                ? transferMutation.error.message
                : 'Failed to transfer fees'}
            </div>
          )}
          {transferMutation.isSuccess && (
            <div className="mb-4 rounded-md bg-green-500/10 p-3 text-sm text-green-600">
              Successfully transferred {transferMutation.data?.transferred || 0} fees
            </div>
          )}
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
                    {fee.transferTxHash && (
                      <p className="text-xs text-blue-600 mt-1">
                        <a
                          href={`https://etherscan.io/tx/${fee.transferTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          View Transfer
                        </a>
                      </p>
                    )}
                    <p className={`text-xs mt-1 ${
                      fee.status === 'transferred' ? 'text-green-600' :
                      fee.status === 'failed' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {fee.status}
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

