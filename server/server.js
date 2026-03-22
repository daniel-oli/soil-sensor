const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

let lastSensorData = null;

function parseNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

app.post('/sensor', (req, res) => {
  const {
    temperatura,
    umidade,
    ph,
    condutividade,
    nitrogenio,
    fosforo,
    potassio,
  } = req.body;

  const parsed = {
    temperatura: parseNumber(temperatura),
    umidade: parseNumber(umidade),
    ph: parseNumber(ph),
    condutividade: parseNumber(condutividade),
    nitrogenio: parseNumber(nitrogenio),
    fosforo: parseNumber(fosforo),
    potassio: parseNumber(potassio),
  };

  const hasInvalidField = Object.values(parsed).some((value) => value === null);

  if (hasInvalidField) {
    return res.status(400).json({
      message:
        'Payload inválido. Envie todos os campos numéricos: temperatura, umidade, ph, condutividade, nitrogenio, fosforo, potassio.',
    });
  }

  lastSensorData = {
    ...parsed,
    receivedAt: new Date().toISOString(),
  };

  return res.status(200).json({
    message: 'Dados recebidos com sucesso',
    data: lastSensorData,
  });
});

app.get('/sensor', (req, res) => {
  if (!lastSensorData) {
    return res.status(200).json({
      message: 'Nenhum dado recebido ainda',
      data: null,
    });
  }

  return res.status(200).json({ data: lastSensorData });
});

/*
  PONTO DE CONEXÃO (ESP-01/Arduino -> Node):
  1) Descubra o IP do seu PC com: ipconfig
  2) No ESP-01, faça POST para: http://SEU_IP_LOCAL:${PORT}/sensor
  3) A porta ${PORT} deve estar liberada no firewall.
*/
app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://  10.101.109.96:${PORT}`);
  console.log(`Servidor acessível na rede local em http://  10.101.109.96:${PORT}`);
});
