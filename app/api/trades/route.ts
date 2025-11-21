import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { trades, agents } from '@/lib/db/schema';
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
    const status = searchParams.get('status');

    let query = db.select().from(trades);

    // Join with agents to filter by user
    if (agentId) {
      query = query.where(eq(trades.agentId, agentId));
    }

    // Add additional filters
    const conditions = [];
    if (symbol) {
      conditions.push(eq(trades.symbol, symbol));
    }
    if (status) {
      conditions.push(eq(trades.status, status as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const userTrades = await query.orderBy(desc(trades.createdAt)).limit(100);

    // Verify trades belong to user's agents
    const agentIds = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.userId, session.user.id));

    const agentIdSet = new Set(agentIds.map((a) => a.id));
    const filteredTrades = userTrades.filter((trade) =>
      agentIdSet.has(trade.agentId)
    );

    return NextResponse.json({ trades: filteredTrades });
  } catch (error) {
    console.error('Error fetching trades:', error);
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
    const { agentId, symbol, side, amount, price } = body;

    if (!agentId || !symbol || !side || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Get runtime and execute trade
    const runtime = getAgentRuntime(agentId);
    if (!runtime) {
      return NextResponse.json(
        { error: 'Agent runtime not available' },
        { status: 400 }
      );
    }

    // Execute trade via action
    const tradeResult = await runtime.processActions(
      {
        id: crypto.randomUUID() as any,
        entityId: session.user.id as any,
        roomId: agentId,
        content: {
          text: `${side} ${amount} ${symbol}`,
        },
        createdAt: Date.now(),
      } as any,
      [
        {
          id: crypto.randomUUID() as any,
          entityId: agentId,
          roomId: agentId,
          content: {
            text: `Executing ${side} order`,
            actions: ['EXECUTE_TRADE'],
          },
          createdAt: Date.now(),
        } as any,
      ],
      undefined,
      async () => []
    );

    // Store trade in database
    const [newTrade] = await db
      .insert(trades)
      .values({
        agentId,
        symbol,
        side: side as any,
        amount: amount.toString(),
        price: price ? price.toString() : '0',
        status: 'executed',
        executedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ trade: newTrade }, { status: 201 });
  } catch (error) {
    console.error('Error executing trade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

