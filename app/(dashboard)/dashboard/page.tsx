import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/components/dashboard/stats';
import { RecentTrades } from '@/components/dashboard/recent-trades';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your trading activity
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentTrades />
        <Card>
          <CardHeader>
            <CardTitle>Active Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No active opportunities at this time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

