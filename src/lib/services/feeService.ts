import { db } from '@/lib/db';
import { transactionFees, trades } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface FeeCalculation {
  feeAmount: number;
  feePercentage: number;
  tradeValue: number;
}

export interface FeeConfig {
  percentage: number; // e.g., 0.001 for 0.1%
  minimumFee?: number; // Optional minimum fee amount
  maximumFee?: number; // Optional maximum fee amount
}

/**
 * Default fee configuration: 0.1% transaction fee
 */
const DEFAULT_FEE_CONFIG: FeeConfig = {
  percentage: 0.001, // 0.1%
  minimumFee: 0.01, // $0.01 minimum
};

/**
 * Calculate transaction fee based on trade value
 */
export function calculateFee(
  tradeValue: number,
  config: FeeConfig = DEFAULT_FEE_CONFIG
): FeeCalculation {
  let feeAmount = tradeValue * config.percentage;

  // Apply minimum fee if specified
  if (config.minimumFee && feeAmount < config.minimumFee) {
    feeAmount = config.minimumFee;
  }

  // Apply maximum fee if specified
  if (config.maximumFee && feeAmount > config.maximumFee) {
    feeAmount = config.maximumFee;
  }

  return {
    feeAmount: Math.round(feeAmount * 100) / 100, // Round to 2 decimal places
    feePercentage: config.percentage,
    tradeValue,
  };
}

/**
 * Record a transaction fee in the database
 */
export async function recordFee(
  tradeId: string,
  userId: string,
  agentId: string,
  feeCalculation: FeeCalculation
): Promise<string> {
  const [fee] = await db
    .insert(transactionFees)
    .values({
      tradeId,
      userId,
      agentId,
      feeAmount: feeCalculation.feeAmount.toString(),
      feePercentage: feeCalculation.feePercentage.toString(),
      tradeValue: feeCalculation.tradeValue.toString(),
      status: 'collected',
      collectedAt: new Date(),
    })
    .returning();

  return fee.id;
}

/**
 * Get total fees collected for a user
 */
export async function getUserTotalFees(userId: string): Promise<number> {
  const fees = await db
    .select()
    .from(transactionFees)
    .where(eq(transactionFees.userId, userId));

  return fees
    .filter((f) => f.status === 'collected')
    .reduce((sum, fee) => sum + parseFloat(fee.feeAmount), 0);
}

/**
 * Get fees for a specific trade
 */
export async function getTradeFees(tradeId: string) {
  return await db
    .select()
    .from(transactionFees)
    .where(eq(transactionFees.tradeId, tradeId))
    .limit(1);
}

/**
 * Get fee statistics for a user
 */
export async function getUserFeeStats(userId: string) {
  const fees = await db
    .select()
    .from(transactionFees)
    .where(eq(transactionFees.userId, userId));

  const collectedFees = fees.filter((f) => f.status === 'collected');
  const totalFees = collectedFees.reduce(
    (sum, fee) => sum + parseFloat(fee.feeAmount),
    0
  );
  const feeCount = collectedFees.length;

  return {
    totalFees,
    feeCount,
    averageFee:
      feeCount > 0 ? totalFees / feeCount : 0,
  };
}

