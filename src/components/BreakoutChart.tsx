import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useBreakoutStore } from '../store/useBreakoutStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

export const BreakoutChart = () => {
  const data = useBreakoutStore(state => state.data);
  const breakoutDates = useBreakoutStore(state => state.breakoutDates);

  const labels = data.map(d => d.date);
  const prices = data.map(d => d.close);
  const volumes = data.map(d => d.volume);
  const delivery = data.map(d => d.deliveryQty);

  return (
    <div className="bg-white p-4 rounded shadow space-y-6">
      <h3 className="font-bold text-blue-600">📊 Breakout Overview</h3>

      <Line
        data={{
          labels,
          datasets: [{
            label: 'Close Price',
            data: prices,
            borderColor: '#3b82f6',
            backgroundColor: breakoutDates.map(date =>
              labels.includes(date) ? '#f59e0b' : 'transparent'
            ),
            pointRadius: breakoutDates.map(date =>
              labels.includes(date) ? 6 : 2
            ),
            tension: 0.4
          }]
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: { mode: 'index', intersect: false }
          }
        }}
      />

      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'Volume',
              data: volumes,
              backgroundColor: '#60a5fa',
            },
            {
              label: 'Delivery Qty',
              data: delivery,
              backgroundColor: '#a78bfa',
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
        }}
      />
    </div>
  );
};
