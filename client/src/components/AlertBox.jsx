export default function AlertBox({ alerts, title = 'Alertas' }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-amber-900">{title}</h3>
      {alerts.length === 0 ? (
        <p className="mt-2 text-sm text-amber-800">Nenhum alerta no momento.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-amber-900">
          {alerts.map((alert, index) => (
            <li key={`${alert}-${index}`} className="rounded-lg bg-white/70 px-3 py-2">
              {alert}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
