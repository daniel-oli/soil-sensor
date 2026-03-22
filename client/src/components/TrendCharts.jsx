import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(148, 163, 184, 0.2)',
      },
    },
    x: {
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
      },
    },
  },
};

export default function TrendCharts({ history }) {
  const hasData = history.labels.length > 0;

  const data = {
    labels: history.labels,
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: history.temperatura,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.12)',
        fill: true,
        tension: 0.35,
      },
      {
        label: 'Umidade (%)',
        data: history.umidade,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.10)',
        fill: true,
        tension: 0.35,
      },
      {
        label: 'pH',
        data: history.ph,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.10)',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-slate-800">Histórico em Tempo Real</h3>
      <p className="mt-1 text-sm text-slate-500">Temperatura, umidade e pH (últimas leituras)</p>
      <div className="mt-4 h-80">
        {hasData ? (
          <Line options={options} data={data} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
            Aguardando dados do sensor para iniciar os gráficos.
          </div>
        )}
      </div>
    </div>
  );
}
