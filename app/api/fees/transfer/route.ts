import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { transactionFees } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { transferUSDCToTreasury, batchTransferUSDCToTreasury } from '@/lib/services/usdcTransferService';

/**
 * Manually trigger USDC transfer for a specific fee
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow admin/owner to trigger transfers
    // In production, add proper admin check
    const body = await request.json();
    const { feeId, batch } = body;

    if (batch && Array.isArray(batch)) {
      // Batch transfer multiple fees
      const fees = await db
        .select()
        .from(transactionFees)
        .where(
          and(
            eq(transactionFees.status, 'collected'),
            eq(transactionFees.userId, session.user.id)
          )
        )
        .limit(50); // Limit batch size

      const transferData = fees.map((fee) => ({
        id: fee.id,
        amountUSD: parseFloat(fee.feeAmount),
      }));

      const results = await batchTransferUSDCToTreasury(transferData);

      return NextResponse.json({
        success: true,
        results,
        transferred: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      });
    } else if (feeId) {
      // Transfer single fee
      const [fee] = await db
        .select()
        .from(transactionFees)
        .where(
          and(
            eq(transactionFees.id, feeId),
            eq(transactionFees.userId, session.user.id)
          )
        )
        .limit(1);

      if (!fee) {
        return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
      }

      if (fee.status !== 'collected') {
        return NextResponse.json(
          { error: `Fee already ${fee.status}` },
          { status: 400 }
        );
      }

      const result = await transferUSDCToTreasury(
        parseFloat(fee.feeAmount),
        fee.id
      );

      return NextResponse.json({
        success: result.success,
        txHash: result.txHash,
        error: result.error,
      });
    } else {
      return NextResponse.json(
        { error: 'feeId or batch required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error transferring fees:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

