import UploadCSV from './components/UploadCSV';
import TradingViewChart from './components/TradingViewChart';
import { BreakoutPredictionPanel } from './components/BreakoutPredictionPanel';

export default function App() {
  return (
    <main className="p-6 max-w-7xl mx-auto space-y-6 bg-slate-950 min-h-screen">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Advanced Breakout Prediction System
        </h1>
        <p className="text-slate-400">
          Multi-factor analysis with market correlation for accurate breakout prediction
        </p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <UploadCSV />
          <TradingViewChart />
        </div>
        <div className="xl:col-span-1">
          <BreakoutPredictionPanel />
        </div>
      </div>
    </main>
  );
}