// utils/computeBreakouts.ts

// utils/computeBreakouts.ts
import type { TradingDay } from '../types/TradingDay';

export const computeBreakouts = (data: TradingDay[]): string[] => {
  return data.filter((day, i, arr) => {
    const prev = arr[i - 1];
    if (!prev) return false;

    const deliveryPct = (day.deliveryQty / day.volume) * 100;
    const volumeSpike = day.volume > prev.volume * 1.2;
    const priceJump = day.close > prev.close * 1.02;
    const deliveryDrop = deliveryPct < 60;

    return volumeSpike && priceJump && deliveryDrop;
  }).map(day => day.date);
};
