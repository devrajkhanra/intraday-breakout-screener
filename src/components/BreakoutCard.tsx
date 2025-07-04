import { useBreakoutStore } from '../store/useBreakoutStore';

const BreakoutCard = () => {
  const breakoutDates = useBreakoutStore(state => state.breakoutDates);

  return (
    <div className="bg-blue-50 p-4 rounded shadow-md">
      <h2 className="text-lg font-bold text-blue-700 mb-2">🔥 Breakout Sessions</h2>
      <ul className="space-y-1">
        {breakoutDates.map(date => (
          <li key={date} className="bg-white rounded px-3 py-1 shadow">
            {date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BreakoutCard;
