import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OpportunitiesList } from '@/components/trading/opportunities-list';

export default function OpportunitiesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">
            Trading opportunities detected by your agents
          </p>
        </div>
        <Button>Scan Now</Button>
      </div>

      <OpportunitiesList />
    </div>
  );
}

