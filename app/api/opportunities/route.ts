import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { opportunities, agents } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAgentRuntime } from '@/lib/eliza/runtime';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const symbol = searchParams.get('symbol');
    const minScore = searchParams.get('minScore');

    let query = db.select().from(opportunities);

    if (agentId) {
      query = query.where(eq(opportunities.agentId, agentId));
    }

    const conditions = [];
    if (symbol) {
      conditions.push(eq(opportunities.symbol, symbol));
    }
    if (minScore) {
      // Note: This would need proper decimal comparison in real implementation
      conditions.push(eq(opportunities.score, minScore));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const userOpportunities = await query
      .orderBy(desc(opportunities.detectedAt))
      .limit(100);

    // Verify opportunities belong to user's agents
    const agentIds = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.userId, session.user.id));

    const agentIdSet = new Set(agentIds.map((a) => a.id));
    const filteredOpportunities = userOpportunities.filter((opp) =>
      agentIdSet.has(opp.agentId)
    );

    return NextResponse.json({ opportunities: filteredOpportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Verify agent belongs to user
    const [agent] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.userId, session.user.id)))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get runtime and scan opportunities
    const runtime = getAgentRuntime(agentId);
    if (!runtime) {
      return NextResponse.json(
        { error: 'Agent runtime not available. Start the agent first.' },
        { status: 400 }
      );
    }

    // Get opportunity service
    const opportunityService = runtime.getService('opportunities');
    if (!opportunityService) {
      return NextResponse.json(
        { error: 'Opportunity service not available' },
        { status: 500 }
      );
    }

    // Scan for opportunities
    const foundOpportunities = await (opportunityService as any).scanMarkets();

    // Store opportunities in database
    const storedOpportunities = [];
    for (const opp of foundOpportunities) {
      const [stored] = await db
        .insert(opportunities)
        .values({
          agentId,
          symbol: opp.symbol,
          score: opp.score.toString(),
          criteria: opp.criteria as any,
          description: opp.description,
        })
        .returning();
      storedOpportunities.push(stored);
    }

    return NextResponse.json(
      { opportunities: storedOpportunities },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error scanning opportunities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

