import type {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  ActionResult,
} from '@elizaos/core';

export const executeTradeAction: Action = {
  name: 'EXECUTE_TRADE',
  description: 'Execute a buy or sell order with risk management',
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content?.text?.toLowerCase() || '';
    return (
      text.includes('buy') ||
      text.includes('sell') ||
      text.includes('trade') ||
      text.includes('execute')
    );
  },
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      const text = message.content?.text || '';
      
      // Parse trade intent (simplified - in production, use LLM to parse)
      const buyMatch = text.match(/buy\s+(\d+\.?\d*)\s+(\w+)/i);
      const sellMatch = text.match(/sell\s+(\d+\.?\d*)\s+(\w+)/i);

      if (!buyMatch && !sellMatch) {
        return {
          success: false,
          text: 'Could not parse trade command. Format: "buy 0.1 BTC" or "sell 0.5 ETH"',
        };
      }

      const match = buyMatch || sellMatch;
      const side = buyMatch ? 'buy' : 'sell';
      const amount = parseFloat(match![1]);
      const symbol = match![2].toUpperCase();

      await callback({
        text: `Validating and executing ${side} order for ${amount} ${symbol}...`,
      });

      // Get trading service
      const tradingService = runtime.getService('trading');
      if (!tradingService) {
        return {
          success: false,
          text: 'Trading service not available',
        };
      }

      // Validate trade
      const validation = await (tradingService as any).validateTrade({
        side,
        amount,
        symbol,
      });

      if (!validation.valid) {
        await callback({
          text: `Trade rejected: ${validation.reason}`,
        });
        return {
          success: false,
          text: validation.reason,
        };
      }

      // Execute trade
      const result = await (tradingService as any).executeTrade({
        side,
        amount,
        symbol,
      });

      const feeInfo = result.fee
        ? ` (Fee: $${result.fee.amount.toFixed(2)})`
        : '';
      await callback({
        text: `✅ Trade executed: ${result.summary}${feeInfo}`,
      });

      // Store trade in memory
      await runtime.createMemory({
        content: {
          text: `Executed ${side} ${amount} ${symbol} at ${result.price}${feeInfo}`,
          metadata: {
            type: 'trade',
            tradeId: result.tradeId,
            side,
            amount,
            symbol,
            price: result.price,
            fee: result.fee,
          },
        },
      });

      return {
        success: true,
        text: `Trade executed successfully`,
        values: { trade: result },
      };
    } catch (error) {
      runtime.logger.error('Error executing trade:', error);
      return {
        success: false,
        text: `Error executing trade: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};

