import { formatCurrency, formatPercentage } from '../utils/formatters';

interface AnalysisPanelProps {
  analysis: {
    trend: string;
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
  };
}

export const AnalysisPanel = ({ analysis }: AnalysisPanelProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-900/50';
      case 'medium': return 'text-yellow-400 bg-yellow-900/50';
      case 'high': return 'text-red-400 bg-red-900/50';
      default: return 'text-slate-400 bg-slate-900/50';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-400 bg-green-900/50';
      case 'bearish': return 'text-red-400 bg-red-900/50';
      case 'neutral': return 'text-yellow-400 bg-yellow-900/50';
      default: return 'text-slate-400 bg-slate-900/50';
    }
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Overview */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg border-b border-slate-600 pb-2">
            Market Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Trend:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(analysis.trend)}`}>
                {analysis.trend.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className="text-white font-semibold text-sm">
                  {analysis.probability}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    analysis.probability > 70 ? 'bg-green-500' :
                    analysis.probability < 30 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${analysis.probability}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Risk Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.riskLevel)}`}>
                {analysis.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h4 className="text-slate-300 font-medium mb-2">Analysis Summary</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {analysis.reasoning}
            </p>
          </div>
        </div>

        {/* Key Levels */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg border-b border-slate-600 pb-2">
            Key Price Levels
          </h3>
          
          <div className="space-y-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-red-400 font-medium">Resistance</span>
                <span className="text-white font-mono font-semibold">
                  {formatCurrency(analysis.keyLevels.resistance)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Key level to watch for breakout
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-400 font-medium">Target</span>
                <span className="text-white font-mono font-semibold">
                  {formatCurrency(analysis.keyLevels.target)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Projected price target
              </div>
            </div>
            
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-400 font-medium">Support</span>
                <span className="text-white font-mono font-semibold">
                  {formatCurrency(analysis.keyLevels.support)}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Key support level to hold
              </div>
            </div>
          </div>
        </div>

        {/* Technical Signals */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg border-b border-slate-600 pb-2">
            Technical Signals
          </h3>
          
          <div className="space-y-3">
            {analysis.signals.slice(0, 3).map((signal, index) => (
              <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium text-sm">{signal.type}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${
                      signal.strength > 70 ? 'text-green-400' :
                      signal.strength < 30 ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {signal.strength}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      signal.strength > 70 ? 'bg-green-500' :
                      signal.strength < 30 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${signal.strength}%` }}
                  />
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{signal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};