import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { agents } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createAgentRuntime } from '@/lib/eliza/runtime';
import { createTradingCharacter } from '@/lib/eliza/character';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, session.user.id));

    return NextResponse.json({ agents: userAgents });
  } catch (error) {
    console.error('Error fetching agents:', error);
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
    const { name, settings } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Agent name is required' },
        { status: 400 }
      );
    }

    // Create trading character
    const character = createTradingCharacter(name, settings);

    // Create agent in database
    const [newAgent] = await db
      .insert(agents)
      .values({
        userId: session.user.id,
        name,
        character: character as any,
        status: 'inactive',
        settings: settings || {},
      })
      .returning();

    return NextResponse.json({ agent: newAgent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

