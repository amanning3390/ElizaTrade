'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Briefcase, AlertCircle, DollarSign } from 'lucide-react';

export function DashboardStats() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [tradesRes, opportunitiesRes, feesRes] = await Promise.all([
        fetch('/api/trades'),
        fetch('/api/opportunities'),
        fetch('/api/fees?stats=true'),
      ]);

      const trades = await tradesRes.json();
      const opportunities = await opportunitiesRes.json();
      const fees = await feesRes.json();

      return {
        totalTrades: trades.trades?.length || 0,
        activeOpportunities: opportunities.opportunities?.length || 0,
        portfolioValue: 100000, // Mock value
        profitLoss: 5000, // Mock value
        totalFeesPaid: fees.totalFees || 0,
      };
    },
  });

  const statsData = [
    {
      title: 'Portfolio Value',
      value: `$${stats?.portfolioValue.toLocaleString() || '0'}`,
      icon: Wallet,
      change: '+5.2%',
    },
    {
      title: 'Total Trades',
      value: stats?.totalTrades || 0,
      icon: Briefcase,
      change: 'This month',
    },
    {
      title: 'Opportunities',
      value: stats?.activeOpportunities || 0,
      icon: TrendingUp,
      change: 'Active',
    },
    {
      title: 'Total Fees Paid',
      value: `$${stats?.totalFeesPaid?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      change: `${stats?.feeCount || 0} transactions`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

