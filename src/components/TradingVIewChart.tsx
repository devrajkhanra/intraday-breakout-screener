import { useEffect, useRef } from 'react';
import {
  createChart} from 'lightweight-charts'
import type {CandlestickData,
  HistogramData,
  UTCTimestamp,
} from 'lightweight-charts';
import { useBreakoutStore } from '../store/useBreakoutStore';

const TradingViewChart = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const data = useBreakoutStore(state => state.data);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      height: 500,
      width: containerRef.current.clientWidth,
      layout: { backgroundColor: '#ffffff', textColor: '#333' },
      grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
      timeScale: { timeVisible: true, borderColor: '#ddd' },
      rightPriceScale: { borderColor: '#ddd' },
    });

    // 🕯️ Main Candlestick Price Series
    const candlestickSeries = chart.addCandlestickSeries({
      priceScaleId: 'right',
    });

    // 📊 Volume Series BELOW candles
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      color: '#60a5fa',
      priceScaleId: 'volume',
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    // 📦 Delivery Volume Series BELOW candles
    const deliverySeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      color: '#a78bfa',
      priceScaleId: 'volume',
      scaleMargins: { top: 0.6, bottom: 0.2 },
    });

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
      color: '#60a5fa',
    }));

    const deliveries: HistogramData[] = data.map(d => ({
      time: convertDate(d.date),
      value: d.deliveryQty,
      color: '#a78bfa',
    }));

    candlestickSeries.setData(candles);
    volumeSeries.setData(volumes);
    deliverySeries.setData(deliveries);

    chart.subscribeCrosshairMove(param => {
      if (param?.time && tooltipRef.current) {
        const index = candles.findIndex(c => c.time === param.time);
        if (index !== -1) {
          const row = data[index];
          const percent = ((row.deliveryQty / row.volume) * 100).toFixed(2);
          tooltipRef.current.innerHTML = `
            <div class="text-sm font-mono p-2 bg-white rounded shadow-md border border-gray-300 space-y-1">
              <div>📅 <b>${row.date}</b></div>
              <div>💰 Close: ₹${row.close}</div>
              <div>📊 Volume: ${row.volume.toLocaleString()}</div>
              <div>📦 Delivery: ${row.deliveryQty.toLocaleString()}</div>
              <div>📈 Delivery %: ${percent}%</div>
            </div>
          `;
        }
      }
    });

    return () => chart.remove();
  }, [data]);

  return (
    <div className="relative w-full h-[500px]">
      <div ref={containerRef} className="absolute inset-0" />
      <div ref={tooltipRef} className="absolute top-4 left-4 pointer-events-none z-10" />
    </div>
  );
};

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
