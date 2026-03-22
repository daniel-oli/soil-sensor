const toneMap = {
  blue: 'border-sky-200 bg-sky-50',
  green: 'border-emerald-200 bg-emerald-50',
  purple: 'border-violet-200 bg-violet-50',
  amber: 'border-amber-200 bg-amber-50',
  rose: 'border-rose-200 bg-rose-50',
  slate: 'border-slate-200 bg-white',
};

export default function SensorCard({ title, value, unit, tone = 'slate', expected }) {
  const toneClass = toneMap[tone] || toneMap.slate;

  return (
    <div className={`rounded-2xl border p-4 shadow-soft transition hover:-translate-y-0.5 ${toneClass}`}>
      <h3 className="text-sm font-medium text-slate-600">{title}</h3>
      <p className="mt-2 text-2xl font-bold text-slate-800">
        {value ?? '--'}
        {value !== null && value !== undefined ? ` ${unit}` : ''}
      </p>
      {expected && <p className="mt-2 text-xs font-medium text-slate-500">Ideal: {expected}</p>}
    </div>
  );
}
