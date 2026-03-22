import { plantDatabase } from './plantDatabase';

function checkRange(value, range) {
  return value >= range[0] && value <= range[1];
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function analyzePlant(sensorData, plantType) {
  if (!sensorData || !plantType || !plantDatabase[plantType]) {
    return {
      status: 'Atenção',
      alerts: ['Sem dados suficientes para análise'],
      warnings: ['Sem dados suficientes para análise'],
      criticalAlerts: [],
      recommendations: ['Selecione uma planta e aguarde dados do sensor'],
      metrics: {
        npk: null,
        ies: null,
        rbn: null,
        pdf: null,
        igs: null,
      },
    };
  }

  const ideal = plantDatabase[plantType];
  const alerts = [];
  const warnings = [];
  const criticalAlerts = [];
  const recommendations = [];

  const T = toNumber(sensorData.temperatura);
  const U = toNumber(sensorData.umidade);
  const pH = toNumber(sensorData.ph);
  const ECuS = toNumber(sensorData.condutividade);
  const N = toNumber(sensorData.nitrogenio);
  const P = toNumber(sensorData.fosforo);
  const K = toNumber(sensorData.potassio);

  if ([T, U, pH, ECuS, N, P, K].some((value) => value === null)) {
    return {
      status: 'Atenção',
      alerts: ['Dados inválidos recebidos do sensor'],
      warnings: ['Dados inválidos recebidos do sensor'],
      criticalAlerts: [],
      recommendations: ['Verifique tipos numéricos enviados pelo Arduino/ESP-01'],
      metrics: {
        npk: null,
        ies: null,
        rbn: null,
        pdf: null,
        igs: null,
      },
    };
  }

  const U_SAFE = U <= 0 ? 0.1 : U;
  const ECmS = ECuS / 1000;

  const npk = (N + P + K) / 3;
  const ies = ECmS / U_SAFE;
  const rbn = Math.abs(pH - 6.5) * npk;
  const pdf = (U / 100) * (T / 40);
  const erroT = Math.abs(T - 25);
  const erroU = Math.abs(U - 60);
  const erroPH = Math.abs(pH - 6.5);
  const erroEC = Math.abs(ECmS - 1.5);
  const igs = clamp(100 - (erroT + erroU + erroPH + erroEC), 0, 100);

  if (!checkRange(T, ideal.temperatura)) {
    if (T < ideal.temperatura[0]) {
      alerts.push('Temperatura baixa');
      recommendations.push('Aumentar temperatura do ambiente ou proteger a planta');
    } else {
      alerts.push('Temperatura alta');
      recommendations.push('Reduzir exposição ao calor e melhorar ventilação');
    }
  }

  if (!checkRange(U, ideal.umidade)) {
    if (U < ideal.umidade[0]) {
      alerts.push('Solo seco');
      recommendations.push('Aumentar irrigação');
    } else {
      alerts.push('Solo encharcado');
      recommendations.push('Reduzir irrigação e melhorar drenagem');
    }
  }

  if (!checkRange(pH, ideal.ph)) {
    if (pH < ideal.ph[0]) {
      alerts.push('Solo ácido');
      recommendations.push('Adicionar calcário');
    } else {
      alerts.push('Solo alcalino');
      recommendations.push('Corrigir pH com matéria orgânica adequada');
    }
  }

  if (ideal.condutividade && !checkRange(ECmS, ideal.condutividade)) {
    if (ECmS < ideal.condutividade[0]) {
      alerts.push('Condutividade baixa');
      recommendations.push('Ajustar solução nutritiva para elevar condutividade');
    } else {
      alerts.push('Condutividade alta');
      recommendations.push('Diluir solução nutritiva e monitorar salinidade');
    }
  }

  if (!checkRange(N, ideal.nitrogenio)) {
    if (N < ideal.nitrogenio[0]) {
      alerts.push('Baixo nitrogênio');
      recommendations.push('Aplicar fertilizante nitrogenado');
    } else {
      alerts.push('Nitrogênio elevado');
      recommendations.push('Reduzir adubação nitrogenada');
    }
  }

  if (!checkRange(P, ideal.fosforo)) {
    if (P < ideal.fosforo[0]) {
      alerts.push('Baixo fósforo');
      recommendations.push('Aplicar fertilizante fosfatado');
    } else {
      alerts.push('Fósforo elevado');
      recommendations.push('Evitar excesso de adubo fosfatado');
    }
  }

  if (!checkRange(K, ideal.potassio)) {
    if (K < ideal.potassio[0]) {
      alerts.push('Baixo potássio');
      recommendations.push('Aplicar fertilizante rico em potássio');
    } else {
      alerts.push('Potássio elevado');
      recommendations.push('Ajustar adubação para reduzir potássio');
    }
  }

  if (ies >= 0.05) {
    criticalAlerts.push('Alerta crítico: estresse salino elevado (IES)');
    recommendations.push('Reduzir salinidade e ajustar irrigação para lixiviação controlada');
  } else if (ies >= 0.02) {
    warnings.push('Aviso: estresse salino em elevação (IES)');
  }

  if (rbn >= 25) {
    criticalAlerts.push('Alerta crítico: alto risco de bloqueio de nutrientes (RBN)');
    recommendations.push('Ajustar pH e reavaliar adubação NPK imediatamente');
  } else if (rbn >= 10) {
    warnings.push('Aviso: risco de bloqueio de nutrientes (RBN)');
  }

  if (pdf >= 0.7) {
    criticalAlerts.push('Alerta crítico: alto potencial de fungos (PDF)');
    recommendations.push('Reduzir umidade excessiva e aumentar ventilação do ambiente');
  } else if (pdf >= 0.4) {
    warnings.push('Aviso: potencial de fungos moderado (PDF)');
  }

  if (U < 25) {
    criticalAlerts.push('Alerta crítico: umidade extremamente baixa');
    recommendations.push('Realizar irrigação imediata e monitorar retenção de água');
  } else if (U < 40) {
    warnings.push('Aviso: umidade abaixo do ideal');
  }

  if (pH < 5.5 || pH > 7.5) {
    warnings.push('Aviso: pH fora da faixa recomendada (5.5 – 7.5)');
  }

  if (T > 40) {
    criticalAlerts.push('Alerta crítico: temperatura acima de 40°C');
    recommendations.push('Resfriar ambiente e reduzir estresse térmico da planta');
  }

  if (igs < 50) {
    criticalAlerts.push('Alerta crítico: saúde geral do solo baixa (IGS)');
    recommendations.push('Reequilibrar condições do solo com correção integrada');
  }

  let status = 'Saudável';
  if (criticalAlerts.length > 0 || alerts.length > 2) {
    status = 'Problemas';
  } else if (alerts.length > 0 || warnings.length > 0) {
    status = 'Atenção';
  }

  return {
    status,
    alerts: [...new Set([...alerts, ...warnings])],
    warnings: [...new Set(warnings)],
    criticalAlerts: [...new Set(criticalAlerts)],
    recommendations: [...new Set(recommendations)],
    metrics: {
      npk: round(npk),
      ies: round(ies, 4),
      rbn: round(rbn),
      pdf: round(pdf, 4),
      igs: round(igs),
    },
  };
}
