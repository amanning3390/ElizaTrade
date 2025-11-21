import type { Evaluator, IAgentRuntime, Memory, State } from '@elizaos/core';

export const patternRecognitionEvaluator: Evaluator = {
  name: 'PATTERN_RECOGNITION',
  description: 'Identify recurring market patterns and successful trade setups',
  alwaysRun: false,
  shouldRun: async (message: Memory, state: State) => {
    return message.content?.metadata?.type === 'trade';
  },
  handler: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    try {
      // Search memory for similar past trades
      const pastTrades = await runtime.searchMemories({
        query: 'successful trades with similar market conditions',
        filter: { 'metadata.type': 'trade', 'metadata.outcome': 'success' },
        count: 5,
      });

      if (pastTrades.length >= 3) {
        // Pattern identified
        const pattern = {
          description: 'Recurring successful trade pattern detected',
          count: pastTrades.length,
          commonFactors: ['similar entry conditions', 'consistent risk management'],
        };

        await runtime.createMemory({
          content: {
            text: `Pattern identified: ${pattern.description}`,
            metadata: {
              type: 'trading_pattern',
              pattern,
            },
          },
        });

        runtime.logger.info('Trading pattern recognized', pattern);
      }
    } catch (error) {
      runtime.logger.error('Error recognizing patterns:', error);
    }
  },
};

