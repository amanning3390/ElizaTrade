import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { opportunities, agents } from '@/lib/db/schema';
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

    const [opportunity] = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, params.id))
      .limit(1);

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      );
    }

    // Verify opportunity belongs to user's agent
    const [agent] = await db
      .select()
      .from(agents)
      .where(
        and(
          eq(agents.id, opportunity.agentId),
          eq(agents.userId, session.user.id)
        )
      )
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ opportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

