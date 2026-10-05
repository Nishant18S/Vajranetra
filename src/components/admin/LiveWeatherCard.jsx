import { Cloud, Wind, Droplets, Thermometer, CloudRain, RefreshCw } from 'lucide-react';

/**
 * Format a number. If the value is null/undefined/NaN, return the fallback.
 * OpenWeatherMap returns null for `rain.1h` when there was no rain —
 * for that field we pass a fallback of 0, because null = "no rain".
 */
function fmt(v, digits = 1, fallback = null) {
  if (v == null || Number.isNaN(Number(v))) {
    return fallback == null ? '—' : fallback;
  }
  return Number(v).toFixed(digits).replace(/\.0+$/, '');
}

export default function LiveWeatherCard({ weather, onRefresh, refreshing }) {
  if (!weather) return null;

  const header = (
    <div className="vn-adm-panel__hd">
      <span className="vn-adm-panel__title flex items-center gap-2">
        <Cloud size={12} /> Live Weather
      </span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="vn-adm-btn vn-adm-btn--outline"
          disabled={refreshing}
        >
          <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  );

  if (weather.status === 'unavailable') {
    return (
      <section className="vn-adm-panel">
        {header}
        <div className="p-4">
          <p className="text-xs" style={{ color: 'var(--a-text-dim)' }}>
            OpenWeatherMap API key not configured.
          </p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--a-text-faint)' }}>
            Add <code>OPENWEATHER_API_KEY</code> to <code>api/.env</code> and
            restart the backend.
          </p>
        </div>
      </section>
    );
  }

  if (weather.status === 'error') {
    return (
      <section className="vn-adm-panel">
        {header}
        <div className="p-4">
          <p className="text-xs" style={{ color: 'var(--a-red)' }}>
            {weather.reason || 'Could not fetch weather.'}
          </p>
        </div>
      </section>
    );
  }

  // rain_1h_mm may be null when no rain has fallen. That's 0 mm, not "unknown".
  const rain1h = fmt(weather.rain_1h_mm, 1, '0');
  const rain3h = weather.rain_3h_mm != null ? fmt(weather.rain_3h_mm, 1, '0') : null;

  return (
    <section className="vn-adm-panel">
      {header}
      <div className="p-4 space-y-4">
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--a-text)' }}>
            {weather.location_name}
            {weather.country && (
              <span className="ml-2 text-[10px]" style={{ color: 'var(--a-text-faint)' }}>
                {weather.country}
              </span>
            )}
          </div>
          <div
            className="text-[11px] mt-0.5"
            style={{ color: 'var(--a-text-dim)', textTransform: 'capitalize' }}
          >
            {weather.condition_description || weather.condition}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <Stat
            icon={Thermometer}
            label="Temperature"
            value={`${fmt(weather.temperature_c, 1)}°C`}
          />
          <Stat
            icon={Thermometer}
            label="Feels like"
            value={`${fmt(weather.feels_like_c, 1)}°C`}
          />
          <Stat
            icon={Droplets}
            label="Humidity"
            value={`${fmt(weather.humidity_pct, 0)}%`}
          />
          <Stat
            icon={Wind}
            label="Wind"
            value={`${fmt(weather.wind_speed_ms, 1)} m/s`}
          />
          <Stat
            icon={Cloud}
            label="Clouds"
            value={`${fmt(weather.cloud_cover_pct, 0, '0')}%`}
          />
          <Stat
            icon={CloudRain}
            label="Rain (1h)"
            value={`${rain1h} mm`}
          />
        </div>

        {rain3h != null && (
          <div
            className="text-[11px]"
            style={{ color: 'var(--a-text-dim)' }}
          >
            Rain (last 3h): <span className="mono">{rain3h} mm</span>
          </div>
        )}

        <div
          className="text-[10px] pt-2 border-t"
          style={{ color: 'var(--a-text-faint)', borderColor: 'var(--a-border-soft)' }}
        >
          Source: OpenWeatherMap · Fetched {weather.fetched_at}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} style={{ color: 'var(--a-text-dim)' }} className="mt-0.5" />
      <div>
        <div className="kpi-label">{label}</div>
        <div className="font-mono mt-0.5" style={{ color: 'var(--a-text)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}