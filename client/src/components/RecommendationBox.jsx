export default function RecommendationBox({ recommendations }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-emerald-900">Recomendações</h3>
      {recommendations.length === 0 ? (
        <p className="mt-2 text-sm text-emerald-800">Sem recomendações. Condições ideais.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-emerald-900">
          {recommendations.map((recommendation, index) => (
            <li key={`${recommendation}-${index}`} className="rounded-lg bg-white/70 px-3 py-2">
              {recommendation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
