import type {
  Action,
  IAgentRuntime,
  Memory,
  State,
  HandlerCallback,
  ActionResult,
} from '@elizaos/core';

export const scanOpportunitiesAction: Action = {
  name: 'SCAN_OPPORTUNITIES',
  description: 'Scan markets for trading opportunities based on multiple criteria',
  validate: async (runtime: IAgentRuntime, message: Memory) => {
    const text = message.content?.text?.toLowerCase() || '';
    return (
      text.includes('scan') ||
      text.includes('opportunity') ||
      text.includes('find trades')
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
      await callback({
        text: 'Scanning markets for trading opportunities...',
      });

      // Get opportunity service
      const opportunityService = runtime.getService('opportunities');
      if (!opportunityService) {
        return {
          success: false,
          text: 'Opportunity service not available',
        };
      }

      // Scan for opportunities
      const opportunities = await (opportunityService as any).scanMarkets();

      if (opportunities.length === 0) {
        await callback({
          text: 'No trading opportunities found at this time.',
        });
        return {
          success: true,
          text: 'No opportunities found',
          values: { opportunities: [] },
        };
      }

      const opportunityText = opportunities
        .slice(0, 5)
        .map(
          (opp: any, idx: number) =>
            `${idx + 1}. ${opp.symbol}: Score ${opp.score.toFixed(2)} - ${opp.description}`
        )
        .join('\n');

      await callback({
        text: `Found ${opportunities.length} opportunities:\n${opportunityText}`,
      });

      return {
        success: true,
        text: `Found ${opportunities.length} opportunities`,
        values: { opportunities },
      };
    } catch (error) {
      runtime.logger.error('Error scanning opportunities:', error);
      return {
        success: false,
        text: `Error scanning opportunities: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
};

