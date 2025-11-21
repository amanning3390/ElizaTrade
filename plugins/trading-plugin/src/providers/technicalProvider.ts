import type { IAgentRuntime, Memory, Provider, State } from '@elizaos/core';

export const technicalProvider: Provider = {
  name: 'TECHNICAL_INDICATORS',
  description: 'Technical indicators: RSI, MACD, Bollinger Bands, support/resistance levels',
  dynamic: true,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    try {
      // In a real implementation, calculate technical indicators from price data
      const symbols = ['BTC', 'ETH', 'SOL'];
      const indicators: Record<string, any> = {};

      for (const symbol of symbols) {
        indicators[symbol] = {
          rsi: 50 + (Math.random() - 0.5) * 40, // RSI between 30-70
          macd: {
            value: (Math.random() - 0.5) * 1000,
            signal: (Math.random() - 0.5) * 1000,
            histogram: (Math.random() - 0.5) * 500,
          },
          bollinger: {
            upper: 100 + Math.random() * 50,
            middle: 100,
            lower: 50 + Math.random() * 50,
          },
          support: 90 + Math.random() * 10,
          resistance: 110 + Math.random() * 10,
        };
      }

      const indicatorText = Object.entries(indicators)
        .map(([symbol, data]) => {
          return `${symbol}:
  RSI: ${data.rsi.toFixed(2)}
  MACD: ${data.macd.value.toFixed(2)}
  Support: $${data.support.toFixed(2)}
  Resistance: $${data.resistance.toFixed(2)}`;
        })
        .join('\n\n');

      return {
        text: `Technical indicators:\n${indicatorText}`,
        data: { indicators, timestamp: Date.now() },
      };
    } catch (error) {
      runtime.logger.error('Error calculating technical indicators:', error);
      return {
        text: 'Unable to calculate technical indicators',
        data: { indicators: {}, error: String(error) },
      };
    }
  },
};

