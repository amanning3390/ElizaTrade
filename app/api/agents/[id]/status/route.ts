import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { agents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAgentRuntime } from '@/lib/eliza/runtime';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [agent] = await db
      .select()
      .from(agents)
      .where(
        and(eq(agents.id, params.id), eq(agents.userId, session.user.id))
      )
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check if runtime is actually running
    const runtime = getAgentRuntime(agent.id as any);
    const actualStatus = runtime ? 'active' : 'inactive';

    // Update database if status differs
    if (agent.status !== actualStatus) {
      await db
        .update(agents)
        .set({ status: actualStatus as any, updatedAt: new Date() })
        .where(eq(agents.id, params.id));
    }

    return NextResponse.json({
      agentId: agent.id,
      status: actualStatus,
      character: agent.character,
      settings: agent.settings,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching agent status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

