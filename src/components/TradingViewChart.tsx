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
  ISeriesApi,
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
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#374151', style: LineStyle.Dotted },
        horzLines: { color: '#374151', style: LineStyle.Dotted },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#4b5563',
      },
      rightPriceScale: {
        borderColor: '#4b5563',
        scaleMargins: { top: 0.1, bottom: 0.4 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6b7280',
          width: 1,
          style: LineStyle.Dashed,
        },
        horzLine: {
          color: '#6b7280',
          width: 1,
          style: LineStyle.Dashed,
        },
      },
    });

    chartRef.current = chart;

    // Main candlestick series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
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

    // Prepare data
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
      color: d.close >= d.open ? '#10b98150' : '#ef444450',
    }));

    const deliveries: HistogramData[] = data.map(d => ({
      time: convertDate(d.date),
      value: d.deliveryQty,
      color: '#8b5cf650',
    }));

    // Set data
    candleSeries.setData(candles);
    volumeSeries.setData(volumes);
    deliverySeries.setData(deliveries);

    // Add support/resistance lines
    addTechnicalLevels(chart, data);

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
        }
      } else {
        // Show latest data when not hovering
        const latestIndex = data.length - 1;
        const latestData = data[latestIndex];
        const prevData = data[latestIndex - 1];
        const technicalAnalysis = generateTechnicalAnalysis(latestData, prevData, data.slice(Math.max(0, latestIndex - 20)));
        
        setCurrentData({
          ...latestData,
          index: latestIndex,
          analysis: technicalAnalysis,
        });
      }
    });

    // Set initial analysis
    if (data.length > 0) {
      const latestIndex = data.length - 1;
      const latestData = data[latestIndex];
      const prevData = data[latestIndex - 1];
      const technicalAnalysis = generateTechnicalAnalysis(latestData, prevData, data.slice(Math.max(0, latestIndex - 20)));
      
      setAnalysis(technicalAnalysis);
      setCurrentData({
        ...latestData,
        index: latestIndex,
        analysis: technicalAnalysis,
      });
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
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Technical Analysis Chart</h2>
      </div>
      
      <div className="relative">
        <div ref={containerRef} className="w-full h-[600px]" />
        
        {currentData && (
          <TechnicalTooltip data={currentData} />
        )}
      </div>
      
      {analysis && (
        <AnalysisPanel analysis={analysis} />
      )}
    </div>
  );
};

function addTechnicalLevels(chart: IChartApi, data: any[]) {
  if (data.length < 20) return;

  // Calculate support and resistance levels
  const prices = data.map(d => d.close);
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);

  // Simple support/resistance calculation
  const resistance = Math.max(...highs.slice(-20));
  const support = Math.min(...lows.slice(-20));
  const currentPrice = prices[prices.length - 1];

  // Add horizontal lines for key levels
  const priceLine1 = {
    price: resistance,
    color: '#ef4444',
    lineWidth: 2,
    lineStyle: LineStyle.Dashed,
    axisLabelVisible: true,
    title: 'Resistance',
  };

  const priceLine2 = {
    price: support,
    color: '#10b981',
    lineWidth: 2,
    lineStyle: LineStyle.Dashed,
    axisLabelVisible: true,
    title: 'Support',
  };

  // Add moving average line
  const ma20 = calculateMovingAverage(prices, 20);
  if (ma20.length > 0) {
    const maLine = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
      title: 'MA(20)',
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