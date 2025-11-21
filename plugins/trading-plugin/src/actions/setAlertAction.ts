import type {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  ActionResult,
} from '@elizaos/core';

export const setAlertAction: Action = {
  name: 'SET_ALERT',
  description: 'Set price alerts or condition-based notifications',
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content?.text?.toLowerCase() || '';
    return text.includes('alert') || text.includes('notify') || text.includes('watch');
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
      
      // Parse alert intent (simplified)
      const priceMatch = text.match(/(\w+)\s+(?:above|below|at)\s+\$?(\d+\.?\d*)/i);
      if (!priceMatch) {
        return {
          success: false,
          text: 'Could not parse alert. Format: "alert BTC above $50000"',
        };
      }

      const symbol = priceMatch[1].toUpperCase();
      const price = parseFloat(priceMatch[2]);
      const condition = text.toLowerCase().includes('above') ? 'above' : 'below';

      await callback({
        text: `Setting alert: ${symbol} ${condition} $${price}`,
      });

      // In a real implementation, store alert in database
      await runtime.createMemory({
        content: {
          text: `Alert set: ${symbol} ${condition} $${price}`,
          metadata: {
            type: 'alert',
            symbol,
            price,
            condition,
          },
        },
      });

      return {
        success: true,
        text: `Alert set for ${symbol} ${condition} $${price}`,
        values: { alert: { symbol, price, condition } },
      };
    } catch (error) {
      runtime.logger.error('Error setting alert:', error);
      return {
        success: false,
        text: `Error setting alert: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};

