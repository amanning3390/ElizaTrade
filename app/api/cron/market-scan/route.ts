import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAgentRuntime } from '@/lib/eliza/runtime';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all active agents
    const activeAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.status, 'active'));

    const results = [];

    for (const agent of activeAgents) {
      try {
        const runtime = getAgentRuntime(agent.id as any);
        if (!runtime) {
          continue;
        }

        // Get opportunity service and scan
        const opportunityService = runtime.getService('opportunities');
        if (opportunityService) {
          const opportunities = await (opportunityService as any).scanMarkets();
          results.push({
            agentId: agent.id,
            opportunitiesFound: opportunities.length,
          });
        }
      } catch (error) {
        console.error(`Error scanning for agent ${agent.id}:`, error);
        results.push({
          agentId: agent.id,
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      message: 'Market scan completed',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in market scan cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

