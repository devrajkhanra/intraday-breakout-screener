import { create } from 'zustand';
import type { TradingDay } from '../types/TradingDay';

interface Store {
  data: TradingDay[];
  breakoutDates: string[];
  setData: (data: TradingDay[]) => void;
  setBreakoutDates: (dates: string[]) => void;
}

export const useBreakoutStore = create<Store>((set) => ({
  data: [],
  breakoutDates: [],
  setData: (data) => set({ data }),
  setBreakoutDates: (dates) => set({ breakoutDates: dates }),
}));
