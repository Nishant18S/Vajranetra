/**
 * Build a spoken sentence and a written recommendation from a
 * region inspection response. Plain English, no jargon.
 */

const RISK_ORDER = { LOW: 1, MODERATE: 2, HIGH: 3, CRITICAL: 4 };

const TASK_LABELS = {
  thunderstorm: 'thunderstorm',
  cloudburst: 'cloudburst',
  flash_flood: 'flash flood',
};

function maxRiskOf(list) {
  if (!list || list.length === 0) return null;
  return list.reduce(
    (acc, h) =>
      RISK_ORDER[h.risk] > RISK_ORDER[acc.risk] ? h : acc,
    list[0]
  );
}

/**
 * @param {object} data — response from /api/admin/region/inspect
 * @returns {{ text: string, recommendation: string|null, severity: 'INFO'|'WARN'|'CRIT' }}
 */
export function narrate(data) {
  if (!data) {
    return {
      text: 'No data available for this location.',
      recommendation: null,
      severity: 'INFO',
    };
  }

  const place =
    data.location?.short_name ||
    data.location?.name ||
    'this location';

  if (data.forecast_error) {
    return {
      text: `Cannot inspect ${place}. ${data.forecast_error}.`,
      recommendation: null,
      severity: 'INFO',
    };
  }

  const tasks = data.forecast?.tasks || {};
  const summary = [];

  for (const [key, label] of Object.entries(TASK_LABELS)) {
    const list = tasks[key];
    if (!list) continue;
    const worst = maxRiskOf(list);
    if (worst) {
      summary.push({ key, label, worst });
    }
  }

  if (summary.length === 0) {
    return {
      text: `No forecast available for ${place}.`,
      recommendation: null,
      severity: 'INFO',
    };
  }

  // Highest overall
  const overall = summary.reduce(
    (acc, s) =>
      RISK_ORDER[s.worst.risk] > RISK_ORDER[acc.worst.risk] ? s : acc,
    summary[0]
  );

  const { label, worst } = overall;
  const hours = worst.horizon_hours;
  const prob = Math.round(worst.probability * 100);

  const weather = data.live_weather;
  const weatherLine =
    weather?.status === 'ok'
      ? ` Live conditions at ${place}: ${weather.temperature_c} degrees, ${
          weather.condition_description || weather.condition || 'unknown conditions'
        }, humidity ${weather.humidity_pct} percent.`
      : '';

  const sevMap = { CRITICAL: 'CRIT', HIGH: 'WARN', MODERATE: 'INFO', LOW: 'INFO' };
  const severity = sevMap[worst.risk] || 'INFO';

  const text =
    `AI inspection for ${place}. ` +
    `Highest risk is a ${label} at plus ${hours} hours, ` +
    `with a ${prob} percent probability, classified as ${worst.risk}.` +
    weatherLine;

  // Recommendation depends on severity and agreement with live weather
  let recommendation = null;

  if (worst.risk === 'CRITICAL') {
    if (weather?.status === 'ok' && (weather.cloud_cover_pct ?? 0) > 60) {
      recommendation =
        'Live weather agrees with the model. Recommend dispatching an alert for this region.';
    } else if (weather?.status === 'ok') {
      recommendation =
        'Model shows CRITICAL, but live weather is still relatively clear. Cross-check with radar before dispatching.';
    } else {
      recommendation =
        'Live weather is unavailable. Cross-check with radar before dispatching.';
    }
  } else if (worst.risk === 'HIGH') {
    recommendation =
      'Consider acknowledging and monitoring. Dispatch only if live conditions match.';
  } else if (worst.risk === 'MODERATE') {
    recommendation = 'Keep watching. No alert required yet.';
  } else {
    recommendation = 'No action required for this location.';
  }

  return { text, recommendation, severity };
}