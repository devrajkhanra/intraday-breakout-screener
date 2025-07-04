import type { TradingDay } from '../types/TradingDay';

export type DayNarrative = {
  summary: string;
  probability: number;
  marker: '↑' | '↓' | '⚠️';
  color: string;
};

export function generateNarrative(today: TradingDay, yesterday?: TradingDay): DayNarrative {
  const deliveryPercent = (today.deliveryQty / today.volume) * 100;
  const priceChange = today.close - today.open;
  const isBullish = priceChange > 0;
  const isBearish = priceChange < 0;

  let summary = '';
  let probability = 50;
  let marker: DayNarrative['marker'] = '⚠️';
  let color = '#facc15'; // amber

  if (deliveryPercent > 70 && isBullish) {
    summary = 'Strong delivery-backed buying';
    probability = 80;
    marker = '↑';
    color = '#22c55e'; // green
  } else if (deliveryPercent < 30 && isBearish) {
    summary = 'Weak delivery and bearish close';
    probability = 30;
    marker = '↓';
    color = '#ef4444'; // red
  } else if (deliveryPercent > 60 && today.volume > (yesterday?.volume || 0)) {
    summary = 'Rising volume with high delivery — possible breakout setup';
    probability = 70;
    marker = '↑';
    color = '#3b82f6'; // blue
  } else {
    summary = 'Neutral day with mixed signals';
    probability = 50;
  }

  return { summary, probability, marker, color };
}
