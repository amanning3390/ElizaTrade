import type { Evaluator, IAgentRuntime, Memory, State } from '@elizaos/core';

export const tradePerformanceEvaluator: Evaluator = {
  name: 'TRADE_PERFORMANCE',
  description: 'Analyze trade outcomes and learn from successes/failures',
  alwaysRun: false,
  shouldRun: async (message: Memory, state: State) => {
    return message.content?.metadata?.type === 'trade_result';
  },
  handler: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    try {
      const trade = message.content?.metadata?.trade;
      const outcome = message.content?.metadata?.outcome;

      if (!trade || !outcome) {
        return;
      }

      // Analyze what worked/didn't work
      const analysis = `Trade analysis:
Symbol: ${trade.symbol}
Side: ${trade.side}
Outcome: ${outcome}
${outcome === 'success' ? 'Pattern: This trade setup was successful' : 'Pattern: This trade setup failed'}`;

      // Store learnings in memory
      await runtime.createMemory({
        content: {
          text: analysis,
          metadata: {
            type: 'trading_insight',
            tradeId: trade.id,
            outcome,
          },
        },
      });

      runtime.logger.info('Trade performance evaluated', { tradeId: trade.id, outcome });
    } catch (error) {
      runtime.logger.error('Error evaluating trade performance:', error);
    }
  },
};

