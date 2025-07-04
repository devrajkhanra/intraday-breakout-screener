import Papa from 'papaparse';
import { useBreakoutStore } from '../store/useBreakoutStore';
import { computeBreakouts } from '../utils/computeBreakouts';
import type { TradingDay } from '../types/TradingDay';

const UploadCSV = () => {
  const setData = useBreakoutStore(state => state.setData);
  const setBreakoutDates = useBreakoutStore(state => state.setBreakoutDates);

  const handleCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        const parsed: TradingDay[] = result.data.map((raw: any) => ({
          date: raw['Date  ']?.trim(),
          close: parseFloat(raw['Close Price  ']?.replace(/,/g, '') || '0'),
          open: parseFloat(raw['Open Price  ']?.replace(/,/g, '') || '0'),
          high: parseFloat(raw['High Price  ']?.replace(/,/g, '') || '0'),
          low: parseFloat(raw['Low Price  ']?.replace(/,/g, '') || '0'),
          volume: parseInt(raw['Total Traded Quantity  ']?.replace(/,/g, '') || '0'),
          deliveryQty: parseInt(raw['Deliverable Qty  ']?.replace(/,/g, '') || '0'),
        }));

        setData(parsed);
        setBreakoutDates(computeBreakouts(parsed));
      }
    });
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        📂 Upload CSV
      </label>
      <input
        type="file"
        accept=".csv"
        className="border p-2 rounded bg-white shadow-sm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCSV(file);
        }}
      />
    </div>
  );
};

export default UploadCSV;
