// App.tsx
import UploadCSV from './components/UploadCSV';
import BreakoutCard from './components/BreakoutCard';

export default function App() {
  return (
    <main className="p-4 space-y-4 max-w-2xl mx-auto">
      <UploadCSV />
      <BreakoutCard />
    </main>
  );
}
