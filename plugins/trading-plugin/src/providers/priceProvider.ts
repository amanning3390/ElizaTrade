import type { IAgentRuntime, Memory, Provider, State } from '@elizaos/core';

export const priceProvider: Provider = {
  name: 'MARKET_PRICES',
  description: 'Real-time cryptocurrency prices and market data',
  dynamic: true,
  get: async (runtime: IAgentRuntime, message: Memory, state: State) => {
    try {
      // In a real implementation, fetch from CoinGecko, CoinMarketCap, or exchange APIs
      const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'ADA'];
      const prices: Record<string, any> = {};

      // Mock prices for now - replace with actual API calls
      for (const symbol of symbols) {
        prices[symbol] = {
          price: Math.random() * 100000, // Mock price
          change24h: (Math.random() - 0.5) * 10, // Mock 24h change
          volume: Math.random() * 1000000000, // Mock volume
        };
      }

      const priceText = Object.entries(prices)
        .map(
          ([symbol, data]) =>
            `${symbol}: $${data.price.toFixed(2)} (${data.change24h > 0 ? '+' : ''}${data.change24h.toFixed(2)}%)`
        )
        .join('\n');

      return {
        text: `Current market prices:\n${priceText}`,
        data: { prices, timestamp: Date.now() },
      };
    } catch (error) {
      runtime.logger.error('Error fetching prices:', error);
      return {
        text: 'Unable to fetch current market prices',
        data: { prices: {}, error: String(error) },
      };
    }
  },
};

