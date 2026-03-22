/*
  PONTO DE CONEXÃO (FRONTEND -> BACKEND):
  - Para desenvolvimento local: deixe localhost.
  - Para ESP-01/Arduino na mesma rede: troque para o IP do PC
    onde o servidor Node está rodando (ex.: http://  10.101.109.96:3001).
  - Opção recomendada: configurar no .env como VITE_API_URL.
*/
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getLatestSensorData() {
  const response = await fetch(`${API_URL}/sensor`);
  if (!response.ok) {
    throw new Error('Erro ao buscar dados do sensor');
  }
  const result = await response.json();
  return result.data;
}

export async function sendSensorData(sensorData) {
  const response = await fetch(`${API_URL}/sensor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sensorData),
  });

  if (!response.ok) {
    throw new Error('Erro ao enviar dados do sensor');
  }

  const result = await response.json();
  return result.data;
}

export function generateRandomSensorData() {
  return {
    temperatura: Number((Math.random() * (35 - 12) + 12).toFixed(1)),
    umidade: Math.floor(Math.random() * (90 - 30 + 1)) + 30,
    ph: Number((Math.random() * (8.0 - 4.5) + 4.5).toFixed(1)),
    condutividade: Math.floor(Math.random() * (2200 - 700 + 1)) + 700,
    nitrogenio: Math.floor(Math.random() * (120 - 20 + 1)) + 20,
    fosforo: Math.floor(Math.random() * (80 - 15 + 1)) + 15,
    potassio: Math.floor(Math.random() * (300 - 80 + 1)) + 80,
  };
}
