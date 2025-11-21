'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateAgentForm } from './create-agent-form';

export function AgentSettings() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await fetch('/api/agents');
      return res.json();
    },
  });

  if (isLoading) {
    return <div>Loading agents...</div>;
  }

  const agentList = agents?.agents || [];

  return (
    <div className="space-y-4">
      <CreateAgentForm />
      {agentList.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No agents created yet. Create your first trading agent to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        agentList.map((agent: any) => (
          <Card key={agent.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{agent.name}</span>
                <span
                  className={`text-sm font-normal ${
                    agent.status === 'active'
                      ? 'text-green-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {agent.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={agent.status === 'active' ? 'destructive' : 'default'}
                  onClick={async () => {
                    const action = agent.status === 'active' ? 'stop' : 'start';
                    await fetch(`/api/agents/${agent.id}/${action}`, {
                      method: 'POST',
                    });
                    window.location.reload();
                  }}
                >
                  {agent.status === 'active' ? 'Stop' : 'Start'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

