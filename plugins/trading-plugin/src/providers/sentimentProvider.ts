import type { IAgentRuntime, Memory, Provider, State } from '@elizaos/core';

export const sentimentProvider: Provider = {
  name: 'MARKET_SENTIMENT',
  description: 'News sentiment, social media trends, fear & greed index',
  dynamic: true,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    try {
      // In a real implementation, fetch from news APIs, social media APIs, etc.
      const sentiment = {
        score: 50 + (Math.random() - 0.5) * 40, // Score between 30-70
        fearGreedIndex: Math.floor(Math.random() * 100),
        newsSentiment: Math.random() > 0.5 ? 'positive' : 'negative',
        socialTrend: Math.random() > 0.5 ? 'bullish' : 'bearish',
        summary: 'Market sentiment is neutral with mixed signals from news and social media.',
      };

      return {
        text: `Market sentiment:
Score: ${sentiment.score.toFixed(2)}/100
Fear & Greed Index: ${sentiment.fearGreedIndex}
News: ${sentiment.newsSentiment}
Social: ${sentiment.socialTrend}
${sentiment.summary}`,
        data: { sentiment, timestamp: Date.now() },
      };
    } catch (error) {
      runtime.logger.error('Error fetching sentiment:', error);
      return {
        text: 'Unable to fetch market sentiment',
        data: { sentiment: null, error: String(error) },
      };
    }
  },
};

