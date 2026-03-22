import { useState } from 'react';
import PlantSelector from '../components/PlantSelector.jsx';

const PLANTS = [
  { value: 'alface', label: 'Alface' },
  { value: 'tomate', label: 'Tomate' },
  { value: 'milho', label: 'Milho' },
  { value: 'morango', label: 'Morango' },
  { value: 'pepino', label: 'Pepino' },
  { value: 'cenoura', label: 'Cenoura' },
  { value: 'espinafre', label: 'Espinafre' },
  { value: 'brocolis', label: 'Brócolis' },
  { value: 'pimentao', label: 'Pimentão' },
  { value: 'cebola', label: 'Cebola' },
];

export default function PlantSelectionPage({ onStart }) {
  const [selectedPlant, setSelectedPlant] = useState('');

  const handleStart = () => {
    if (!selectedPlant) {
      return;
    }
    onStart(selectedPlant);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl border border-white/60 bg-white/90 p-8 shadow-soft backdrop-blur">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">Agricultura Inteligente</p>
        <h1 className="text-3xl font-bold text-slate-800">Monitor Inteligente de Solo</h1>
        <p className="mt-2 text-sm text-slate-600">
          Selecione uma cultura para acompanhar os dados do sensor em tempo real.
        </p>

        <div className="mt-6 space-y-4">
        <PlantSelector value={selectedPlant} onChange={setSelectedPlant} options={PLANTS} />
          <button
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleStart}
            disabled={!selectedPlant}
          >
            Iniciar Monitoramento
          </button>
        </div>
      </div>
    </div>
  );
}
