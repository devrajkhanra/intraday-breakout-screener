import type { TradingDay, MarketData, BreakoutPrediction } from '../types/TradingDay';

export class BreakoutPredictor {
  private stockData: TradingDay[];
  private marketData: MarketData[];

  constructor(stockData: TradingDay[], marketData: MarketData[] = []) {
    this.stockData = stockData;
    this.marketData = marketData;
  }

  /**
   * Predicts breakout probability for the next trading day
   */
  predictNextDayBreakout(targetDate: string): BreakoutPrediction {
    const targetIndex = this.stockData.findIndex(d => d.date === targetDate);
    if (targetIndex === -1 || targetIndex === 0) {
      throw new Error('Target date not found or insufficient data');
    }

    // Use data up to the day before target date
    const historicalStock = this.stockData.slice(0, targetIndex);
    const historicalMarket = this.marketData.slice(0, targetIndex);
    const currentDay = historicalStock[historicalStock.length - 1];
    
    // Calculate individual factors
    const stockTechnicals = this.analyzeStockTechnicals(historicalStock);
    const marketCorrelation = this.analyzeMarketCorrelation(historicalStock, historicalMarket);
    const volumePattern = this.analyzeVolumePattern(historicalStock);
    const deliveryTrend = this.analyzeDeliveryTrend(historicalStock);
    const marketSentiment = this.analyzeMarketSentiment(historicalMarket);

    // Weighted scoring system
    const weights = {
      stockTechnicals: 0.25,
      marketCorrelation: 0.20,
      volumePattern: 0.20,
      deliveryTrend: 0.20,
      marketSentiment: 0.15,
    };

    const totalScore = 
      stockTechnicals * weights.stockTechnicals +
      marketCorrelation * weights.marketCorrelation +
      volumePattern * weights.volumePattern +
      deliveryTrend * weights.deliveryTrend +
      marketSentiment * weights.marketSentiment;

    const probability = Math.min(95, Math.max(5, totalScore));
    
    // Determine confidence level
    const confidence = this.getConfidenceLevel(probability, historicalStock.length);
    
    // Determine expected direction
    const expectedDirection = this.determineDirection(historicalStock, historicalMarket);
    
    // Calculate risk-reward
    const riskReward = this.calculateRiskReward(historicalStock, expectedDirection);
    
    // Generate reasoning
    const reasoning = this.generateReasoning({
      stockTechnicals,
      marketCorrelation,
      volumePattern,
      deliveryTrend,
      marketSentiment,
    }, expectedDirection, currentDay);

    return {
      date: targetDate,
      probability,
      confidence,
      factors: {
        stockTechnicals,
        marketCorrelation,
        volumePattern,
        deliveryTrend,
        marketSentiment,
      },
      reasoning,
      expectedDirection,
      riskReward,
    };
  }

  private analyzeStockTechnicals(data: TradingDay[]): number {
    if (data.length < 20) return 50;

    const recent = data.slice(-20);
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    
    let score = 50;

    // Price momentum
    const priceChange = (current.close - previous.close) / previous.close * 100;
    if (priceChange > 2) score += 15;
    else if (priceChange > 0) score += 5;
    else if (priceChange < -2) score -= 15;
    else score -= 5;

    // Moving average position
    const ma20 = this.calculateMA(recent.map(d => d.close), 20);
    if (current.close > ma20[ma20.length - 1]) score += 10;
    else score -= 10;

    // Volatility analysis
    const volatility = this.calculateVolatility(recent.map(d => d.close));
    if (volatility > 3) score += 10; // High volatility before breakout
    else if (volatility < 1) score -= 5; // Too low volatility

    // Support/Resistance levels
    const highs = recent.map(d => d.high);
    const resistance = Math.max(...highs.slice(-10));
    if (current.close > resistance * 0.98) score += 15; // Near resistance

    return Math.min(100, Math.max(0, score));
  }

  private analyzeMarketCorrelation(stockData: TradingDay[], marketData: MarketData[]): number {
    if (marketData.length < 10 || stockData.length < 10) return 50;

    const recentStock = stockData.slice(-10);
    const recentMarket = marketData.slice(-10);
    
    let score = 50;

    // Market direction alignment
    const stockTrend = this.calculateTrend(recentStock.map(d => d.close));
    const marketTrend = this.calculateTrend(recentMarket.map(d => d.niftyClose));
    
    if (stockTrend > 0 && marketTrend > 0) score += 20; // Both bullish
    else if (stockTrend < 0 && marketTrend < 0) score -= 10; // Both bearish
    else if (stockTrend > 0 && marketTrend < 0) score += 5; // Stock outperforming

    // Correlation strength
    const correlation = this.calculateCorrelation(
      recentStock.map(d => d.close),
      recentMarket.map(d => d.niftyClose)
    );

    if (Math.abs(correlation) > 0.7) {
      if (correlation > 0 && marketTrend > 0) score += 15;
      else if (correlation > 0 && marketTrend < 0) score -= 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  private analyzeVolumePattern(data: TradingDay[]): number {
    if (data.length < 10) return 50;

    const recent = data.slice(-10);
    const current = data[data.length - 1];
    
    let score = 50;

    // Volume surge analysis
    const avgVolume = recent.slice(0, -1).reduce((sum, d) => sum + d.volume, 0) / (recent.length - 1);
    const volumeRatio = current.volume / avgVolume;

    if (volumeRatio > 2) score += 25; // Strong volume surge
    else if (volumeRatio > 1.5) score += 15;
    else if (volumeRatio < 0.7) score -= 10; // Weak volume

    // Volume trend
    const volumeTrend = this.calculateTrend(recent.map(d => d.volume));
    if (volumeTrend > 0) score += 10;
    else score -= 5;

    // Price-volume relationship
    const priceChange = (current.close - current.open) / current.open * 100;
    if (priceChange > 0 && volumeRatio > 1.2) score += 15; // Bullish with volume
    else if (priceChange < 0 && volumeRatio > 1.2) score -= 10; // Bearish with volume

    return Math.min(100, Math.max(0, score));
  }

  private analyzeDeliveryTrend(data: TradingDay[]): number {
    if (data.length < 5) return 50;

    const recent = data.slice(-5);
    const current = data[data.length - 1];
    
    let score = 50;

    // Current delivery percentage
    const deliveryPct = (current.deliveryQty / current.volume) * 100;
    
    if (deliveryPct > 70) score += 20; // Strong delivery
    else if (deliveryPct > 50) score += 10;
    else if (deliveryPct < 30) score -= 15; // Weak delivery

    // Delivery trend
    const deliveryTrend = recent.map(d => (d.deliveryQty / d.volume) * 100);
    const trendSlope = this.calculateTrend(deliveryTrend);
    
    if (trendSlope > 0) score += 10; // Improving delivery
    else score -= 5;

    // Delivery vs price relationship
    const priceChange = (current.close - current.open) / current.open * 100;
    if (priceChange > 0 && deliveryPct > 60) score += 15; // Bullish with good delivery
    else if (priceChange < 0 && deliveryPct < 40) score -= 10; // Bearish with poor delivery

    return Math.min(100, Math.max(0, score));
  }

  private analyzeMarketSentiment(marketData: MarketData[]): number {
    if (marketData.length < 5) return 50;

    const recent = marketData.slice(-5);
    const current = marketData[marketData.length - 1];
    
    let score = 50;

    // Market momentum
    const marketTrend = this.calculateTrend(recent.map(d => d.niftyClose));
    if (marketTrend > 0) score += 15;
    else if (marketTrend < 0) score -= 10;

    // VIX analysis (if available)
    if (current.vix !== undefined) {
      if (current.vix < 15) score += 10; // Low volatility, good for breakouts
      else if (current.vix > 25) score -= 10; // High volatility, risky
    }

    // Advance-Decline ratio (if available)
    if (current.advanceDecline !== undefined) {
      if (current.advanceDecline > 1.5) score += 10; // More advances than declines
      else if (current.advanceDecline < 0.7) score -= 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  private determineDirection(stockData: TradingDay[], marketData: MarketData[]): 'bullish' | 'bearish' | 'neutral' {
    const stockTrend = this.calculateTrend(stockData.slice(-10).map(d => d.close));
    const marketTrend = marketData.length > 0 ? 
      this.calculateTrend(marketData.slice(-10).map(d => d.niftyClose)) : 0;
    
    const current = stockData[stockData.length - 1];
    const deliveryPct = (current.deliveryQty / current.volume) * 100;
    
    if (stockTrend > 0 && marketTrend >= 0 && deliveryPct > 60) return 'bullish';
    else if (stockTrend < 0 && marketTrend <= 0 && deliveryPct < 40) return 'bearish';
    else return 'neutral';
  }

  private calculateRiskReward(data: TradingDay[], direction: string): { risk: number; reward: number; ratio: number } {
    const recent = data.slice(-20);
    const current = data[data.length - 1];
    
    const highs = recent.map(d => d.high);
    const lows = recent.map(d => d.low);
    
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);
    
    let risk: number, reward: number;
    
    if (direction === 'bullish') {
      risk = (current.close - support) / current.close * 100;
      reward = (resistance - current.close) / current.close * 100;
    } else {
      risk = (resistance - current.close) / current.close * 100;
      reward = (current.close - support) / current.close * 100;
    }
    
    const ratio = reward / Math.max(risk, 0.1);
    
    return { risk, reward, ratio };
  }

  private generateReasoning(factors: any, direction: string, currentDay: TradingDay): string {
    const deliveryPct = (currentDay.deliveryQty / currentDay.volume) * 100;
    
    let reasoning = `Based on comprehensive analysis: `;
    
    if (factors.stockTechnicals > 70) {
      reasoning += `Strong technical setup with positive price momentum. `;
    } else if (factors.stockTechnicals < 30) {
      reasoning += `Weak technical indicators showing bearish signals. `;
    }
    
    if (factors.marketCorrelation > 70) {
      reasoning += `Market correlation strongly supports the move. `;
    } else if (factors.marketCorrelation < 30) {
      reasoning += `Market conditions are not favorable. `;
    }
    
    if (factors.volumePattern > 70) {
      reasoning += `Exceptional volume pattern indicates institutional interest. `;
    }
    
    if (factors.deliveryTrend > 70) {
      reasoning += `High delivery percentage (${deliveryPct.toFixed(1)}%) shows genuine buying. `;
    } else if (factors.deliveryTrend < 30) {
      reasoning += `Low delivery percentage (${deliveryPct.toFixed(1)}%) suggests speculative activity. `;
    }
    
    reasoning += `Expected direction: ${direction.toUpperCase()}.`;
    
    return reasoning;
  }

  // Utility functions
  private calculateMA(prices: number[], period: number): number[] {
    const ma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      ma.push(sum / period);
    }
    return ma;
  }

  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1] * 100);
    }
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 2) return 0;
    
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private getConfidenceLevel(probability: number, dataPoints: number): 'low' | 'medium' | 'high' {
    if (dataPoints < 20) return 'low';
    if (probability > 75 || probability < 25) return 'high';
    if (probability > 60 || probability < 40) return 'medium';
    return 'low';
  }
}