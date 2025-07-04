import { useState } from 'react';
import { BreakoutPredictor } from '../utils/breakoutPredictor';
import { useBreakoutStore } from '../store/useBreakoutStore';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import type { BreakoutPrediction, MarketData } from '../types/TradingDay';

export const BreakoutPredictionPanel = () => {
  const data = useBreakoutStore(state => state.data);
  const [selectedDate, setSelectedDate] = useState('');
  const [prediction, setPrediction] = useState<BreakoutPrediction | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [error, setError] = useState('');

  // Sample market data for demonstration
  const generateSampleMarketData = () => {
    return data.map((stockDay, index) => ({
      date: stockDay.date,
      niftyClose: 18000 + Math.random() * 2000 - 1000 + index * 10,
      niftyOpen: 18000 + Math.random() * 2000 - 1000 + index * 10,
      niftyHigh: 18000 + Math.random() * 2000 - 1000 + index * 10 + 50,
      niftyLow: 18000 + Math.random() * 2000 - 1000 + index * 10 - 50,
      niftyVolume: 1000000 + Math.random() * 500000,
      vix: 15 + Math.random() * 10,
      advanceDecline: 0.5 + Math.random() * 1.5,
    }));
  };

  const handlePrediction = () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    try {
      const sampleMarketData = generateSampleMarketData();
      const predictor = new BreakoutPredictor(data, sampleMarketData);
      const result = predictor.predictNextDayBreakout(selectedDate);
      setPrediction(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
      setPrediction(null);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400 bg-green-900/50';
      case 'medium': return 'text-yellow-400 bg-yellow-900/50';
      case 'low': return 'text-red-400 bg-red-900/50';
      default: return 'text-slate-400 bg-slate-900/50';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability > 70) return 'text-green-400';
    if (probability < 30) return 'text-red-400';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 space-y-6">
      <div className="border-b border-slate-600 pb-4">
        <h2 className="text-xl font-semibold text-white mb-2">Breakout Prediction Engine</h2>
        <p className="text-slate-400 text-sm">
          Predict breakouts using multi-factor analysis including market correlation
        </p>
      </div>

      {/* Date Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Target Date for Prediction
          </label>
          <div className="flex gap-3">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a date...</option>
              {data.slice(20).map((day) => (
                <option key={day.date} value={day.date}>
                  {day.date}
                </option>
              ))}
            </select>
            <button
              onClick={handlePrediction}
              disabled={!selectedDate}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Predict
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-2">{error}</p>
          )}
        </div>
      </div>

      {/* Prediction Results */}
      {prediction && (
        <div className="space-y-6">
          {/* Main Prediction */}
          <div className="bg-slate-900/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Prediction for {prediction.date}
              </h3>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                  {prediction.confidence.toUpperCase()} CONFIDENCE
                </span>
                <span className={`text-2xl font-bold ${getProbabilityColor(prediction.probability)}`}>
                  {prediction.probability}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-slate-300 font-medium mb-3">Expected Direction</h4>
                <div className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                  prediction.expectedDirection === 'bullish' ? 'bg-green-900/50 text-green-400' :
                  prediction.expectedDirection === 'bearish' ? 'bg-red-900/50 text-red-400' :
                  'bg-yellow-900/50 text-yellow-400'
                }`}>
                  {prediction.expectedDirection.toUpperCase()}
                </div>
              </div>

              <div>
                <h4 className="text-slate-300 font-medium mb-3">Risk-Reward Ratio</h4>
                <div className="text-white">
                  <span className="text-2xl font-bold">
                    {prediction.riskReward.ratio.toFixed(2)}:1
                  </span>
                  <div className="text-sm text-slate-400 mt-1">
                    Risk: {formatPercentage(prediction.riskReward.risk)} | 
                    Reward: {formatPercentage(prediction.riskReward.reward)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-slate-300 font-medium mb-2">Analysis Summary</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {prediction.reasoning}
              </p>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="bg-slate-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Factor Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(prediction.factors).map(([factor, score]) => (
                <div key={factor} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm capitalize">
                      {factor.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`text-sm font-semibold ${
                      score > 70 ? 'text-green-400' :
                      score < 30 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {score.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        score > 70 ? 'bg-green-500' :
                        score < 30 ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Context */}
          <div className="bg-slate-900/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">How This Works</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <p>
                <strong className="text-slate-300">Stock Technicals:</strong> Analyzes price momentum, moving averages, volatility, and support/resistance levels.
              </p>
              <p>
                <strong className="text-slate-300">Market Correlation:</strong> Evaluates how the stock moves relative to Nifty 50 and overall market sentiment.
              </p>
              <p>
                <strong className="text-slate-300">Volume Pattern:</strong> Examines volume surges, trends, and price-volume relationships.
              </p>
              <p>
                <strong className="text-slate-300">Delivery Trend:</strong> Analyzes delivery percentage patterns and institutional interest.
              </p>
              <p>
                <strong className="text-slate-300">Market Sentiment:</strong> Considers broader market conditions, VIX levels, and advance-decline ratios.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};