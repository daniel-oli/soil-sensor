export default function PlantSelector({ value, onChange, options }) {
  return (
    <select
      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Selecione uma planta</option>
      {options.map((plant) => (
        <option key={plant.value} value={plant.value}>
          {plant.label}
        </option>
      ))}
    </select>
  );
}
