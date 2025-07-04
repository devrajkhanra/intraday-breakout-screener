import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';

interface TechnicalTooltipProps {
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    deliveryQty: number;
    analysis: any;
  };
}

export const TechnicalTooltip = ({ data }: TechnicalTooltipProps) => {
  const deliveryPercent = (data.deliveryQty / data.volume) * 100;
  const priceChange = data.close - data.open;
  const priceChangePercent = (priceChange / data.open) * 100;

  return (
    <div className="absolute top-4 left-4 bg-gray-800 bg-opacity-95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-gray-600 min-w-80 z-10">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-600 pb-2">
          <h3 className="text-white font-semibold text-lg">{data.date}</h3>
          <div className={`px-2 py-1 rounded text-sm font-medium ${
            priceChange >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {formatPercentage(priceChangePercent)}
          </div>
        </div>

        {/* OHLC Data */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Open:</span>
              <span className="text-white font-mono">{formatCurrency(data.open)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">High:</span>
              <span className="text-green-400 font-mono">{formatCurrency(data.high)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Low:</span>
              <span className="text-red-400 font-mono">{formatCurrency(data.low)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Close:</span>
              <span className="text-white font-mono font-semibold">{formatCurrency(data.close)}</span>
            </div>
          </div>
        </div>

        {/* Volume Data */}
        <div className="space-y-2 border-t border-gray-600 pt-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Volume:</span>
            <span className="text-blue-400 font-mono">{formatNumber(data.volume)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Delivery:</span>
            <span className="text-purple-400 font-mono">{formatNumber(data.deliveryQty)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Delivery %:</span>
            <span className={`font-mono font-semibold ${
              deliveryPercent > 70 ? 'text-green-400' : 
              deliveryPercent < 30 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {formatPercentage(deliveryPercent)}
            </span>
          </div>
        </div>

        {/* Technical Analysis */}
        {data.analysis && (
          <div className="border-t border-gray-600 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 text-sm">Market Condition:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                data.analysis.trend === 'bullish' ? 'bg-green-600 text-white' :
                data.analysis.trend === 'bearish' ? 'bg-red-600 text-white' :
                'bg-yellow-600 text-white'
              }`}>
                {data.analysis.trend.toUpperCase()}
              </span>
            </div>
            
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Next Day Probability:</span>
                <span className={`font-semibold ${
                  data.analysis.probability > 70 ? 'text-green-400' :
                  data.analysis.probability < 30 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {data.analysis.probability}%
                </span>
              </div>
              
              <p className="text-gray-300 text-xs mt-2 leading-relaxed">
                {data.analysis.reasoning}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};