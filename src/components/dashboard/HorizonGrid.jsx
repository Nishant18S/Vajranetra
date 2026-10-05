import HorizonCard from '../forecast/HorizonCard';

export default function HorizonGrid({ forecasts = [] }) {
  if (!forecasts.length) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {forecasts.map((h) => (
        <HorizonCard key={h.horizon_hours ?? h.hours} h={h} />
      ))}
    </div>
  );
}