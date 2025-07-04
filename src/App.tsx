import UploadCSV from './components/UploadCSV';
import TradingViewChart from './components/TradingViewChart';

export default function App() {
  return (
    <main className="p-6 max-w-4xl mx-auto space-y-6 bg-gray-100 min-h-screen">
      <UploadCSV />
      <TradingViewChart />
    </main>
  );
}