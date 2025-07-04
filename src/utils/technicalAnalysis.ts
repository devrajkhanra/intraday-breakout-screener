import type { TradingDay } from '../types/TradingDay';

export interface TechnicalAnalysis {
  trend: 'bullish' | 'bearish' | 'neutral';
  probability: number;
  reasoning: string;
  keyLevels: {
    support: number;
    resistance: number;
    target: number;
  };
  riskLevel: 'low' | 'medium' | 'high';
  signals: Array<{
    type: string;
    strength: number;
    description: string;
  }>;
}

export function generateTechnicalAnalysis(
  today: TradingDay,
  yesterday?: TradingDay,
  historicalData: TradingDay[] = []
): TechnicalAnalysis {
  const deliveryPercent = (today.deliveryQty / today.volume) * 100;
  const priceChange = today.close - today.open;
  const priceChangePercent = (priceChange / today.open) * 100;
  
  // Volume analysis
  const avgVolume = historicalData.length > 0 
    ? historicalData.reduce((sum, day) => sum + day.volume, 0) / historicalData.length
    : today.volume;
  const volumeRatio = today.volume / avgVolume;
  
  // Price momentum
  const yesterdayChange = yesterday ? (today.close - yesterday.close) / yesterday.close * 100 : 0;
  
  // Calculate key levels
  const highs = historicalData.map(d => d.high);
  const lows = historicalData.map(d => d.low);
  const resistance = highs.length > 0 ? Math.max(...highs) : today.high * 1.05;
  const support = lows.length > 0 ? Math.min(...lows) : today.low * 0.95;
  
  // Determine trend and probability
  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  let probability = 50;
  let reasoning = '';
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';

  // Technical signals
  const signals = [];

  // Delivery-based analysis
  if (deliveryPercent > 70) {
    signals.push({
      type: 'Strong Delivery',
      strength: Math.min(95, deliveryPercent + 10),
      description: 'High delivery percentage indicates genuine buying interest'
    });
    
    if (priceChangePercent > 0) {
      trend = 'bullish';
      probability = Math.min(85, 60 + deliveryPercent * 0.3);
      reasoning = 'Strong delivery-backed buying with positive price action suggests continued upward momentum.';
      riskLevel = 'low';
    }
  } else if (deliveryPercent < 30) {
    signals.push({
      type: 'Weak Delivery',
      strength: Math.max(5, 100 - deliveryPercent * 2),
      description: 'Low delivery percentage suggests speculative trading'
    });
    
    if (priceChangePercent < 0) {
      trend = 'bearish';
      probability = Math.max(15, 40 - deliveryPercent);
      reasoning = 'Weak delivery combined with negative price action indicates potential selling pressure.';
      riskLevel = 'high';
    }
  }

  // Volume analysis
  if (volumeRatio > 1.5) {
    signals.push({
      type: 'Volume Surge',
      strength: Math.min(90, volumeRatio * 30),
      description: `Volume is ${volumeRatio.toFixed(1)}x above average, indicating strong interest`
    });
    
    if (trend === 'neutral') {
      trend = priceChangePercent > 0 ? 'bullish' : 'bearish';
      probability = Math.min(75, 50 + volumeRatio * 10);
      reasoning = 'High volume breakout suggests significant price movement ahead.';
    }
  } else if (volumeRatio < 0.7) {
    signals.push({
      type: 'Low Volume',
      strength: Math.max(10, (1 - volumeRatio) * 50),
      description: 'Below average volume suggests lack of conviction'
    });
  }

  // Price action signals
  const bodySize = Math.abs(today.close - today.open);
  const totalRange = today.high - today.low;
  const bodyRatio = bodySize / totalRange;

  if (bodyRatio > 0.7) {
    signals.push({
      type: 'Strong Candle',
      strength: Math.min(85, bodyRatio * 100),
      description: 'Large body indicates strong directional movement'
    });
  }

  // Momentum analysis
  if (Math.abs(yesterdayChange) > 2) {
    signals.push({
      type: 'Price Momentum',
      strength: Math.min(80, Math.abs(yesterdayChange) * 20),
      description: `${yesterdayChange > 0 ? 'Positive' : 'Negative'} momentum from previous session`
    });
  }

  // Default reasoning if none set
  if (!reasoning) {
    reasoning = `Mixed signals with ${deliveryPercent.toFixed(1)}% delivery and ${volumeRatio.toFixed(1)}x volume ratio. Market showing ${trend} bias.`;
  }

  // Calculate target based on support/resistance
  const currentPrice = today.close;
  const target = trend === 'bullish' 
    ? currentPrice + (resistance - currentPrice) * 0.6
    : currentPrice - (currentPrice - support) * 0.6;

  return {
    trend,
    probability,
    reasoning,
    keyLevels: {
      support,
      resistance,
      target,
    },
    riskLevel,
    signals: signals.slice(0, 4), // Limit to top 4 signals
  };
}