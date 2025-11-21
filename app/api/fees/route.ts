import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserFeeStats, getUserTotalFees } from '@/lib/services/feeService';
import { db } from '@/lib/db';
import { transactionFees } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get('stats') === 'true';

    if (statsOnly) {
      // Return fee statistics only
      const stats = await getUserFeeStats(session.user.id);
      const totalFees = await getUserTotalFees(session.user.id);

      return NextResponse.json({
        totalFees,
        ...stats,
      });
    }

    // Return fee history
    const fees = await db
      .select()
      .from(transactionFees)
      .where(eq(transactionFees.userId, session.user.id))
      .orderBy(desc(transactionFees.createdAt))
      .limit(100);

    const stats = await getUserFeeStats(session.user.id);
    const totalFees = await getUserTotalFees(session.user.id);

    return NextResponse.json({
      fees,
      stats: {
        totalFees,
        ...stats,
      },
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

