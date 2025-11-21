import { Service } from '@elizaos/core';
import type { IAgentRuntime, ServiceTypeName } from '@elizaos/core';

export class TradingService extends Service {
  static serviceType: ServiceTypeName = 'trading' as ServiceTypeName;
  capabilityDescription = 'Trading service for executing trades and managing positions';

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  async start() {
    this.runtime.logger.info('TradingService started');
  }

  async stop() {
    this.runtime.logger.info('TradingService stopped');
  }

  async validateTrade(trade: {
    side: 'buy' | 'sell';
    amount: number;
    symbol: string;
  }): Promise<{ valid: boolean; reason?: string }> {
    // Check position size limits
    const maxPositionSize = this.runtime.getSetting('maxPositionSize') || 0.1;
    if (trade.amount > maxPositionSize) {
      return {
        valid: false,
        reason: `Position size ${trade.amount} exceeds limit ${maxPositionSize}`,
      };
    }

    // Check daily trade limit
    const maxDailyTrades = this.runtime.getSetting('maxDailyTrades') || 10;
    // In a real implementation, check actual trade count from database
    // For now, always allow

    return { valid: true };
  }

  async executeTrade(trade: {
    side: 'buy' | 'sell';
    amount: number;
    symbol: string;
    userId?: string;
    agentId?: string;
  }): Promise<{
    tradeId: string;
    status: string;
    summary: string;
    price: number;
    fee: {
      amount: number;
      percentage: number;
      tradeValue: number;
    };
  }> {
    // In a real implementation, execute trade via exchange API
    // For now, simulate trade execution
    const price = Math.random() * 100000; // Mock price
    const tradeId = `trade_${Date.now()}`;
    const tradeValue = trade.amount * price;

    // Calculate transaction fee (0.1% default)
    const feePercentage = this.runtime.getSetting('transactionFeePercentage') || 0.001;
    const feeAmount = Math.max(tradeValue * feePercentage, 0.01); // Minimum $0.01

    return {
      tradeId,
      status: 'executed',
      summary: `${trade.side} ${trade.amount} ${trade.symbol} @ $${price.toFixed(2)} (Fee: $${feeAmount.toFixed(2)})`,
      price,
      fee: {
        amount: Math.round(feeAmount * 100) / 100,
        percentage: feePercentage,
        tradeValue,
      },
    };
  }
}

