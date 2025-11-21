import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { agents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { removeAgentRuntime, getAgentRuntime } from '@/lib/eliza/runtime';

export async function POST(
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

    // Check if runtime exists
    const runtime = getAgentRuntime(agent.id as any);
    if (!runtime) {
      // Already stopped
      await db
        .update(agents)
        .set({ status: 'inactive', updatedAt: new Date() })
        .where(eq(agents.id, params.id));

      return NextResponse.json({
        message: 'Agent already stopped',
        agentId: agent.id,
        status: 'inactive',
      });
    }

    // Remove runtime from cache
    removeAgentRuntime(agent.id as any);

    // Update agent status
    await db
      .update(agents)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(agents.id, params.id));

    return NextResponse.json({
      message: 'Agent stopped successfully',
      agentId: agent.id,
      status: 'inactive',
    });
  } catch (error) {
    console.error('Error stopping agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

