// BreakoutCard.tsx
import { useBreakoutStore } from '../store/useBreakoutStore';

const BreakoutCard = () => {
  const breakoutDates = useBreakoutStore(state => state.breakoutDays());

  return (
    <div className="grid gap-2">
      <h2 className="text-lg font-bold text-blue-500">🔥 Breakout Sessions</h2>
      {breakoutDates.map(date => (
        <div key={date} className="bg-blue-100 p-2 rounded-md shadow-sm">
          {date}
        </div>
      ))}
    </div>
  );
};

export default BreakoutCard;
