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
      case 'low': return 'text-green-400 bg-green-900';
      case 'medium': return 'text-yellow-400 bg-yellow-900';
      case 'high': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'text-green-400 bg-green-900';
      case 'bearish': return 'text-red-400 bg-red-900';
      case 'neutral': return 'text-yellow-400 bg-yellow-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Overview */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg border-b border-gray-600 pb-2">
            Market Overview
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Trend:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(analysis.trend)}`}>
                {analysis.trend.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Probability:</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      analysis.probability > 70 ? 'bg-green-500' :
                      analysis.probability < 30 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${analysis.probability}%` }}
                  />
                </div>
                <span className="text-white font-semibold text-sm">
                  {analysis.probability}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Risk Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.riskLevel)}`}>
                {analysis.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              {analysis.reasoning}
            </p>
          </div>
        </div>

        {/* Key Levels */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg border-b border-gray-600 pb-2">
            Key Levels
          </h3>
          
          <div className="space-y-3">
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-red-400 font-medium">Resistance</span>
                <span className="text-white font-mono font-semibold">
                  {formatCurrency(analysis.keyLevels.resistance)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div className="bg-red-500 h-1 rounded-full w-3/4"></div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-400 font-medium">Target</span>
                <span className="text-white font-mono font-semibold">
                  {formatCurrency(analysis.keyLevels.target)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full w-1/2"></div>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-green-400 font-medium">Support</span>
                <span className="text-white font-mono font-semibold">
                  {formatCurrency(analysis.keyLevels.support)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Signals */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg border-b border-gray-600 pb-2">
            Technical Signals
          </h3>
          
          <div className="space-y-3">
            {analysis.signals.map((signal, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{signal.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          signal.strength > 70 ? 'bg-green-500' :
                          signal.strength < 30 ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${signal.strength}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-sm">{signal.strength}%</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">{signal.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};