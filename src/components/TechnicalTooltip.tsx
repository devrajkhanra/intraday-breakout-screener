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
    <div className="absolute top-4 right-4 bg-slate-800 bg-opacity-95 backdrop-blur-sm rounded-lg p-4 shadow-xl border border-slate-600 w-72 z-10">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-600 pb-2">
          <h3 className="text-white font-semibold">{data.date}</h3>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            priceChange >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {formatPercentage(priceChangePercent)}
          </div>
        </div>

        {/* OHLC Data */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Open:</span>
              <span className="text-white font-mono text-xs">{formatCurrency(data.open)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">High:</span>
              <span className="text-green-400 font-mono text-xs">{formatCurrency(data.high)}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Low:</span>
              <span className="text-red-400 font-mono text-xs">{formatCurrency(data.low)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Close:</span>
              <span className="text-white font-mono text-xs font-semibold">{formatCurrency(data.close)}</span>
            </div>
          </div>
        </div>

        {/* Volume Data */}
        <div className="space-y-1 border-t border-slate-600 pt-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Volume:</span>
            <span className="text-blue-400 font-mono text-xs">{formatNumber(data.volume)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Delivery:</span>
            <span className="text-purple-400 font-mono text-xs">{formatNumber(data.deliveryQty)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Delivery %:</span>
            <span className={`font-mono text-xs font-semibold ${
              deliveryPercent > 70 ? 'text-green-400' : 
              deliveryPercent < 30 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {formatPercentage(deliveryPercent)}
            </span>
          </div>
        </div>

        {/* Simple Analysis */}
        {data.analysis && (
          <div className="border-t border-slate-600 pt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-400 text-sm">Outlook:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                data.analysis.trend === 'bullish' ? 'bg-green-600 text-white' :
                data.analysis.trend === 'bearish' ? 'bg-red-600 text-white' :
                'bg-yellow-600 text-white'
              }`}>
                {data.analysis.trend.toUpperCase()}
              </span>
            </div>
            
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className={`font-semibold text-xs ${
                  data.analysis.probability > 70 ? 'text-green-400' :
                  data.analysis.probability < 30 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {data.analysis.probability}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};