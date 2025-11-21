import type { Plugin } from '@elizaos/core';
import { priceProvider } from './providers/priceProvider';
import { technicalProvider } from './providers/technicalProvider';
import { sentimentProvider } from './providers/sentimentProvider';
import { scanOpportunitiesAction } from './actions/scanOpportunitiesAction';
import { executeTradeAction } from './actions/executeTradeAction';
import { setAlertAction } from './actions/setAlertAction';
import { TradingService } from './services/TradingService';
import { OpportunityService } from './services/OpportunityService';
import { RiskManagementService } from './services/RiskManagementService';
import { tradePerformanceEvaluator } from './evaluators/tradePerformanceEvaluator';
import { patternRecognitionEvaluator } from './evaluators/patternRecognitionEvaluator';

export const tradingPlugin: Plugin = {
  name: '@elizaos/trading-plugin',
  description: 'Trading plugin for opportunity identification and execution',
  providers: [priceProvider, technicalProvider, sentimentProvider],
  actions: [scanOpportunitiesAction, executeTradeAction, setAlertAction],
  services: [TradingService, OpportunityService, RiskManagementService],
  evaluators: [tradePerformanceEvaluator, patternRecognitionEvaluator],
};

export default tradingPlugin;

