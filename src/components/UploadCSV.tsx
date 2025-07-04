import Papa from 'papaparse';
import { useBreakoutStore } from '../store/useBreakoutStore';
import { computeBreakouts } from '../utils/computeBreakouts';
import type { TradingDay } from '../types/TradingDay';

const UploadCSV = () => {
  const setData = useBreakoutStore(state => state.setData);
  const setBreakoutDates = useBreakoutStore(state => state.setBreakoutDates);
  const data = useBreakoutStore(state => state.data);

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
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Upload Stock Data</h2>
          <p className="text-slate-400 text-sm mb-4">
            Upload CSV file with stock price and volume data for analysis
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex-1">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCSV(file);
              }}
            />
            <div className="border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-lg p-6 text-center cursor-pointer transition-colors">
              <div className="text-slate-400 mb-2">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-slate-300 font-medium">Click to upload CSV file</p>
              <p className="text-slate-500 text-sm mt-1">Supports NSE/BSE format</p>
            </div>
          </label>
        </div>

        {data.length > 0 && (
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Data loaded:</span>
              <span className="text-white font-semibold">{data.length} trading days</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-slate-300">Date range:</span>
              <span className="text-slate-400 text-sm">
                {data[0]?.date} to {data[data.length - 1]?.date}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCSV;