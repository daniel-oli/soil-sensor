import { useEffect, useMemo, useState } from 'react';
import SensorCard from '../components/SensorCard.jsx';
import AlertBox from '../components/AlertBox.jsx';
import RecommendationBox from '../components/RecommendationBox.jsx';
import TrendCharts from '../components/TrendCharts.jsx';
import {
  generateRandomSensorData,
  getLatestSensorData,
  sendSensorData,
} from '../services/api';
import { analyzePlant } from '../logic/analyzePlant';
import { plantDatabase } from '../logic/plantDatabase';

const SENSOR_FIELDS = [
  { key: 'temperatura', label: 'Temperatura', unit: '°C' },
  { key: 'umidade', label: 'Umidade', unit: '%' },
  { key: 'ph', label: 'pH', unit: '' },
  { key: 'condutividade', label: 'Condutividade', unit: 'µS/cm' },
  { key: 'nitrogenio', label: 'Nitrogênio', unit: 'mg/kg' },
  { key: 'fosforo', label: 'Fósforo', unit: 'mg/kg' },
  { key: 'potassio', label: 'Potássio', unit: 'mg/kg' },
];

const STATUS_LABEL = {
  Saudável: 'Saudável',
  Atenção: 'Atenção',
  Problemas: 'Problemas detectados',
};

const STATUS_STYLE = {
  Saudável: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Atenção: 'bg-amber-100 text-amber-700 border-amber-200',
  Problemas: 'bg-rose-100 text-rose-700 border-rose-200',
};

function getRiskTone(value, warningLimit, alertLimit) {
  if (value === null || value === undefined) {
    return 'slate';
  }
  if (value >= alertLimit) {
    return 'rose';
  }
  if (value >= warningLimit) {
    return 'amber';
  }
  return 'green';
}

function getIgsCardClass(igs) {
  if (igs === null || igs === undefined) {
    return 'border-slate-200 bg-white';
  }
  if (igs >= 80) {
    return 'border-emerald-200 bg-emerald-50';
  }
  if (igs >= 50) {
    return 'border-amber-200 bg-amber-50';
  }
  return 'border-rose-200 bg-rose-50';
}

const SENSOR_TONES = ['blue', 'green', 'purple', 'amber', 'rose', 'slate', 'blue'];

function formatExpectedRange(key, range, unit) {
  if (!range) {
    return null;
  }

  if (key === 'condutividade') {
    const minUS = Math.round(range[0] * 1000);
    const maxUS = Math.round(range[1] * 1000);
    return `${minUS}–${maxUS} ${unit}`;
  }

  return `${range[0]}–${range[1]} ${unit}`.trim();
}

export default function DashboardPage({ plantType, sessionStartedAt, onBack }) {
  const [sensorData, setSensorData] = useState(null);
  const [error, setError] = useState('');
  const [criticalHistory, setCriticalHistory] = useState([]);
  const [lastHistoryStamp, setLastHistoryStamp] = useState('');
  const [chartHistory, setChartHistory] = useState({
    labels: [],
    temperatura: [],
    umidade: [],
    ph: [],
  });
  const [lastChartStamp, setLastChartStamp] = useState('');
  const POLLING_INTERVAL_MS = 3000;
  const selectedPlantIdeal = plantDatabase[plantType] || null;

  useEffect(() => {
    setSensorData(null);
    setError('');
    setCriticalHistory([]);
    setLastHistoryStamp('');
    setChartHistory({
      labels: [],
      temperatura: [],
      umidade: [],
      ph: [],
    });
    setLastChartStamp('');
  }, [plantType, sessionStartedAt]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const data = await getLatestSensorData();
        const isFreshForCurrentSession =
          !sessionStartedAt ||
          !data?.receivedAt ||
          new Date(data.receivedAt).getTime() >= new Date(sessionStartedAt).getTime();

        if (isMounted) {
          setSensorData(isFreshForCurrentSession ? data : null);
          setError('');
        }
      } catch (fetchError) {
        if (isMounted) {
          setError('Não foi possível buscar dados do servidor.');
        }
      }
    }

    fetchData();
    /*
      PONTO DE AJUSTE (frequência do frontend):
      - Se o ESP-01 envia a cada 10s, você pode trocar para 10000.
      - 3000 funciona também (apenas consulta mais vezes o último valor).
    */
    const interval = setInterval(fetchData, POLLING_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [POLLING_INTERVAL_MS, sessionStartedAt]);

  const analysis = useMemo(() => analyzePlant(sensorData, plantType), [sensorData, plantType]);

  useEffect(() => {
    const currentStamp = sensorData?.receivedAt || '';

    if (!currentStamp || currentStamp === lastHistoryStamp || analysis.criticalAlerts.length === 0) {
      return;
    }

    const entries = analysis.criticalAlerts.map((message) => ({
      message,
      timestamp: currentStamp,
    }));

    setCriticalHistory((previous) => [...entries, ...previous].slice(0, 30));
    setLastHistoryStamp(currentStamp);
  }, [analysis.criticalAlerts, lastHistoryStamp, sensorData?.receivedAt]);

  useEffect(() => {
    const currentStamp = sensorData?.receivedAt || '';

    if (!sensorData || !currentStamp || currentStamp === lastChartStamp) {
      return;
    }

    const label = new Date(currentStamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const maxPoints = 20;

    setChartHistory((previous) => ({
      labels: [...previous.labels, label].slice(-maxPoints),
      temperatura: [...previous.temperatura, sensorData.temperatura].slice(-maxPoints),
      umidade: [...previous.umidade, sensorData.umidade].slice(-maxPoints),
      ph: [...previous.ph, sensorData.ph].slice(-maxPoints),
    }));

    setLastChartStamp(currentStamp);
  }, [lastChartStamp, sensorData]);

  const handleSimulate = async () => {
    try {
      const randomData = generateRandomSensorData();
      const savedData = await sendSensorData(randomData);
      setSensorData(savedData);
      setError('');
    } catch (simulationError) {
      setError('Falha ao simular dados. Verifique se o servidor está rodando.');
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <header className="mb-6 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Painel em tempo real</p>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard de Monitoramento</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              onClick={onBack}
            >
            Trocar Planta
            </button>
            <button
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              onClick={handleSimulate}
            >
              Simular Dados
            </button>
          </div>
        </div>
      </header>

      {analysis.criticalAlerts.length > 0 && (
        <section className="mb-4 rounded-2xl border border-rose-300 bg-rose-100 p-4 shadow-soft">
          <h3 className="text-lg font-semibold text-rose-900">Alertas Críticos</h3>
          <ul className="mt-2 space-y-2 text-sm text-rose-900">
            {analysis.criticalAlerts.map((alert, index) => (
              <li key={`${alert}-${index}`} className="rounded-lg bg-white/80 px-3 py-2">
                {alert}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Planta selecionada</p>
          <strong className="text-lg capitalize text-slate-800">{plantType}</strong>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-sm text-slate-500">Status geral</p>
          <span
            className={`mt-1 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
              STATUS_STYLE[analysis.status]
            }`}
          >
            {STATUS_LABEL[analysis.status]}
          </span>
        </div>
      </section>

      {error && (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SENSOR_FIELDS.map((field, index) => (
          <SensorCard
            key={field.key}
            title={field.label}
            value={sensorData?.[field.key]}
            unit={field.unit}
            tone={SENSOR_TONES[index % SENSOR_TONES.length]}
            expected={formatExpectedRange(field.key, selectedPlantIdeal?.[field.key], field.unit)}
          />
        ))}
      </section>

      <section className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SensorCard
          title="Estresse Salino (IES)"
          value={analysis.metrics.ies}
          unit=""
          tone={getRiskTone(analysis.metrics.ies, 0.02, 0.05)}
          expected="< 0.02"
        />
        <SensorCard
          title="Bloqueio de Nutrientes (RBN)"
          value={analysis.metrics.rbn}
          unit=""
          tone={getRiskTone(analysis.metrics.rbn, 10, 25)}
          expected="< 10"
        />
        <SensorCard
          title="Risco de Fungos (PDF)"
          value={analysis.metrics.pdf}
          unit=""
          tone={getRiskTone(analysis.metrics.pdf, 0.4, 0.7)}
          expected="< 0.4"
        />
        <div className={`rounded-2xl border p-4 shadow-soft ${getIgsCardClass(analysis.metrics.igs)}`}>
          <h3 className="text-sm font-medium text-slate-600">Saúde Geral do Solo (IGS)</h3>
          <p className="mt-2 text-2xl font-bold text-slate-800">{analysis.metrics.igs ?? '--'}</p>
          <p className="mt-2 text-xs font-medium text-slate-500">Ideal: ≥ 80</p>
        </div>
      </section>

      <section className="mb-5">
        <TrendCharts history={chartHistory} />
      </section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <AlertBox title="Notificações" alerts={analysis.alerts} />
        <RecommendationBox recommendations={analysis.recommendations} />
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-rose-900">Histórico de Alertas Críticos</h3>
          {criticalHistory.length === 0 ? (
            <p className="mt-2 text-sm text-rose-800">Nenhum alerta crítico registrado.</p>
          ) : (
            <ul className="mt-3 max-h-64 space-y-2 overflow-auto text-sm text-rose-900">
              {criticalHistory.map((item, index) => (
                <li key={`${item.timestamp}-${index}`} className="rounded-lg bg-white/80 px-3 py-2">
                  {new Date(item.timestamp).toLocaleString('pt-BR')} - {item.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
