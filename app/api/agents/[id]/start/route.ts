import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { agents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createAgentRuntime, getAgentRuntime } from '@/lib/eliza/runtime';

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

    // Check if runtime already exists
    const existingRuntime = getAgentRuntime(agent.id as any);
    if (existingRuntime) {
      // Update status to active
      await db
        .update(agents)
        .set({ status: 'active', updatedAt: new Date() })
        .where(eq(agents.id, params.id));

      return NextResponse.json({
        message: 'Agent already running',
        agentId: agent.id,
        status: 'active',
      });
    }

    // Create and initialize runtime
    const runtime = await createAgentRuntime({
      agentId: agent.id as any,
      character: agent.character as any,
      userId: session.user.id,
      settings: agent.settings as any,
    });

    // Update agent status
    await db
      .update(agents)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(agents.id, params.id));

    return NextResponse.json({
      message: 'Agent started successfully',
      agentId: runtime.agentId,
      status: 'active',
    });
  } catch (error) {
    console.error('Error starting agent:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

