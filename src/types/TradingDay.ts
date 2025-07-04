export interface TradingDay {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  deliveryQty: number;
}

export interface MarketData {
  date: string;
  niftyClose: number;
  niftyOpen: number;
  niftyHigh: number;
  niftyLow: number;
  niftyVolume: number;
  vix?: number;
  advanceDecline?: number;
}

export interface BreakoutPrediction {
  date: string;
  probability: number;
  confidence: 'low' | 'medium' | 'high';
  factors: {
    stockTechnicals: number;
    marketCorrelation: number;
    volumePattern: number;
    deliveryTrend: number;
    marketSentiment: number;
  };
  reasoning: string;
  expectedDirection: 'bullish' | 'bearish' | 'neutral';
  riskReward: {
    risk: number;
    reward: number;
    ratio: number;
  };
}