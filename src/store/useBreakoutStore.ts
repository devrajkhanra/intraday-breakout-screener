// useBreakoutStore.ts
import { create } from 'zustand';

interface TradingDay {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  deliveryQty: number;
}

interface Store {
  data: TradingDay[];
  setData: (data: TradingDay[]) => void;
  breakoutDays: () => string[];
}

export const useBreakoutStore = create<Store>((set, get) => ({
  data: [],
  setData: (data) => set({ data }),
  breakoutDays: () => {
    const { data } = get();
    return data
      .filter((day, i, arr) => {
        const prev = arr[i - 1];
        if (!prev) return false;
        const deliveryPct = (day.deliveryQty / day.volume) * 100;
        const volumeSpike = day.volume > prev.volume * 1.2;
        const priceJump = day.close > prev.close * 1.02;
        const deliveryDrop = deliveryPct < 60;
        return volumeSpike && priceJump && deliveryDrop;
      })
      .map(day => day.date);
  }
}));
