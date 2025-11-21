import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { transactionFees } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { batchTransferUSDCToTreasury } from '@/lib/services/usdcTransferService';

/**
 * Cron job to batch transfer collected fees to treasury wallet
 * Runs periodically to transfer accumulated fees
 */
export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all collected fees that haven't been transferred
    const fees = await db
      .select()
      .from(transactionFees)
      .where(eq(transactionFees.status, 'collected'))
      .limit(50); // Process up to 50 fees per run

    if (fees.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No fees to transfer',
        transferred: 0,
      });
    }

    // Prepare transfer data
    const transferData = fees.map((fee) => ({
      id: fee.id,
      amountUSD: parseFloat(fee.feeAmount),
    }));

    // Batch transfer to treasury
    const results = await batchTransferUSDCToTreasury(transferData);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Transferred ${successful} fees, ${failed} failed`,
      transferred: successful,
      failed,
      total: fees.length,
    });
  } catch (error) {
    console.error('Error in batch transfer cron:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

