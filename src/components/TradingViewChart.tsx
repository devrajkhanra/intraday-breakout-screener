import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  LineStyle,
} from 'lightweight-charts';
import type { 
  CandlestickData,
  HistogramData,
  UTCTimestamp,
  IChartApi,
  MouseEventParams,
} from 'lightweight-charts';
import { useBreakoutStore } from '../store/useBreakoutStore';
import { generateTechnicalAnalysis } from '../utils/technicalAnalysis';
import { TechnicalTooltip } from './TechnicalTooltip';
import { AnalysisPanel } from './AnalysisPanel';

const TradingViewChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [currentData, setCurrentData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const data = useBreakoutStore(state => state.data);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(containerRef.current, {
      height: 600,
      width: containerRef.current.clientWidth,
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#e2e8f0',
      },
      grid: {
        vertLines: { color: '#1e293b', style: LineStyle.Solid },
        horzLines: { color: '#1e293b', style: LineStyle.Solid },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#334155',
        rightOffset: 12,
      },
      rightPriceScale: {
        borderColor: '#334155',
        scaleMargins: { top: 0.05, bottom: 0.3 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#64748b',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: '#64748b',
          width: 1,
          style: LineStyle.Dashed,
        },
      },
    });

    chartRef.current = chart;

    // Main candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      priceScaleId: 'right',
    });

    // Volume series in separate panel
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      color: '#3b82f6',
      priceScaleId: 'volume',
      scaleMargins: { top: 0.7, bottom: 0 },
    });

    // Delivery volume overlay
    const deliverySeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      color: '#8b5cf6',
      priceScaleId: 'volume',
      scaleMargins: { top: 0.7, bottom: 0 },
    });

    // Prepare clean data without markers
    const candles: CandlestickData[] = data.map(d => ({
      time: convertDate(d.date),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumes: HistogramData[] = data.map(d => ({
      time: convertDate(d.date),
      value: d.volume,
      color: d.close >= d.open ? '#3b82f640' : '#ef444440',
    }));

    const deliveries: HistogramData[] = data.map(d => ({
      time: convertDate(d.date),
      value: d.deliveryQty,
      color: '#8b5cf640',
    }));

    // Set data
    candleSeries.setData(candles);
    volumeSeries.setData(volumes);
    deliverySeries.setData(deliveries);

    // Add clean technical levels
    addCleanTechnicalLevels(chart, data);

    // Crosshair move handler
    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (param?.time && param.point) {
        const index = candles.findIndex(c => c.time === param.time);
        if (index !== -1) {
          const dayData = data[index];
          const prevData = data[index - 1];
          const technicalAnalysis = generateTechnicalAnalysis(dayData, prevData, data.slice(Math.max(0, index - 20), index + 1));
          
          setCurrentData({
            ...dayData,
            index,
            analysis: technicalAnalysis,
          });
          setShowTooltip(true);
        }
      } else {
        setShowTooltip(false);
        // Show latest data analysis
        const latestIndex = data.length - 1;
        const latestData = data[latestIndex];
        const prevData = data[latestIndex - 1];
        const technicalAnalysis = generateTechnicalAnalysis(latestData, prevData, data.slice(Math.max(0, latestIndex - 20)));
        
        setAnalysis(technicalAnalysis);
      }
    });

    // Set initial analysis
    if (data.length > 0) {
      const latestIndex = data.length - 1;
      const latestData = data[latestIndex];
      const prevData = data[latestIndex - 1];
      const technicalAnalysis = generateTechnicalAnalysis(latestData, prevData, data.slice(Math.max(0, latestIndex - 20)));
      
      setAnalysis(technicalAnalysis);
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Price Chart</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-slate-300">Volume</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-slate-300">Delivery</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div ref={containerRef} className="w-full h-[600px]" />
        
        {showTooltip && currentData && (
          <TechnicalTooltip data={currentData} />
        )}
      </div>
      
      {analysis && (
        <AnalysisPanel analysis={analysis} />
      )}
    </div>
  );
};

function addCleanTechnicalLevels(chart: IChartApi, data: any[]) {
  if (data.length < 20) return;

  // Calculate clean support and resistance levels
  const recentData = data.slice(-20);
  const highs = recentData.map(d => d.high);
  const lows = recentData.map(d => d.low);
  const closes = recentData.map(d => d.close);

  // Simple but effective support/resistance calculation
  const resistance = Math.max(...highs);
  const support = Math.min(...lows);

  // Add clean moving average line
  const ma20 = calculateMovingAverage(closes, 20);
  if (ma20.length > 0) {
    const maLine = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
      title: 'MA(20)',
      lastValueVisible: false,
      priceLineVisible: false,
    });

    const maData = ma20.map((value, index) => ({
      time: convertDate(data[data.length - ma20.length + index].date),
      value,
    }));

    maLine.setData(maData);
  }
}

function calculateMovingAverage(prices: number[], period: number): number[] {
  const ma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    ma.push(sum / period);
  }
  return ma;
}

function convertDate(dateStr: string): UTCTimestamp {
  const [day, mon, year] = dateStr.split('-');
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };
  const isoDate = `${year}-${months[mon]}-${day}`;
  return Math.floor(new Date(isoDate).getTime() / 1000) as UTCTimestamp;
}

export default TradingViewChart;