import { TradesList } from '@/components/trading/trades-list';
import { TradeForm } from '@/components/trading/trade-form';

export default function TradesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Trades</h1>
        <p className="text-muted-foreground">View and execute trades</p>
      </div>

      <TradeForm />

      <TradesList />
    </div>
  );
}

