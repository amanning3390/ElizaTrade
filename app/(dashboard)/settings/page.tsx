import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentSettings } from '@/components/settings/agent-settings';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your trading agents and preferences
        </p>
      </div>

      <AgentSettings />
    </div>
  );
}

