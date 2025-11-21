import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { trades, agents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [trade] = await db
      .select()
      .from(trades)
      .where(eq(trades.id, params.id))
      .limit(1);

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Verify trade belongs to user's agent
    const [agent] = await db
      .select()
      .from(agents)
      .where(
        and(eq(agents.id, trade.agentId), eq(agents.userId, session.user.id))
      )
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ trade });
  } catch (error) {
    console.error('Error fetching trade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [trade] = await db
      .select()
      .from(trades)
      .where(eq(trades.id, params.id))
      .limit(1);

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    // Verify trade belongs to user's agent
    const [agent] = await db
      .select()
      .from(agents)
      .where(
        and(eq(agents.id, trade.agentId), eq(agents.userId, session.user.id))
      )
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only cancel pending trades
    if (trade.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only cancel pending trades' },
        { status: 400 }
      );
    }

    await db
      .update(trades)
      .set({ status: 'cancelled' })
      .where(eq(trades.id, params.id));

    return NextResponse.json({ message: 'Trade cancelled' });
  } catch (error) {
    console.error('Error cancelling trade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

