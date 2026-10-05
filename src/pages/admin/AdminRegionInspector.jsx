import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, MapPin, AlertTriangle, Layers, Volume2, VolumeX,
  Sparkles, ArrowRight, Compass, RefreshCw, Info, Bug,
  CheckCircle2, XCircle, ChevronDown, ChevronRight,
} from 'lucide-react';
import { regionService } from '../../services/regionService';
import LiveWeatherCard from '../../components/admin/LiveWeatherCard';
import RegionMapLayered from '../../components/admin/RegionMapLayered';
import PrecursorsPanel from '../../components/admin/PrecursorsPanel';
import ExplainPanel from '../../components/admin/ExplainPanel';
import TerrainPanel from '../../components/admin/TerrainPanel';
import CTTPanel from '../../components/admin/CTTPanel';
import { useSpeech } from '../../hooks/useSpeech';
import { narrate } from '../../utils/aiNarrative';

const SEV_COLORS = {
  CRITICAL: { bg: 'rgba(239,68,68,0.10)', fg: 'var(--a-red)' },
  HIGH: { bg: 'rgba(249,115,22,0.10)', fg: 'var(--a-orange)' },
  MODERATE: { bg: 'rgba(245,158,11,0.10)', fg: 'var(--a-amber)' },
  LOW: { bg: 'rgba(16,185,129,0.10)', fg: 'var(--a-green)' },
};

export default function AdminRegionInspector() {
  const [query, setQuery] = useState('');
  const [sampleIndex, setSampleIndex] = useState('0');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugLog, setDebugLog] = useState([]);
  const [clickPin, setClickPin] = useState(null);

  const { supported: speechSupported, muted, speak, toggleMute } = useSpeech();

  const logDebug = useCallback((level, message, extra) => {
    setDebugLog((prev) => [
      ...prev.slice(-49),
      {
        time: new Date().toLocaleTimeString(),
        level,
        message,
        extra: extra !== undefined ? JSON.stringify(extra, null, 2) : null,
      },
    ]);
  }, []);

  const runNarrativeAndSpeech = useCallback(
    (res, sourceLabel) => {
      const narr = narrate(res);
      setNarrative(narr);
      logDebug(
        narr?.text ? 'ok' : 'warn',
        narr?.text ? `${sourceLabel}: narrative built` : `${sourceLabel}: narrative empty`,
        narr
      );

      if (!narr?.text) {
        logDebug('warn', 'No narrative text to speak');
        return;
      }

      if (!speechSupported) {
        logDebug('warn', 'Speech not attempted: browser does not support speechSynthesis');
        return;
      }
      if (muted) {
        logDebug('info', 'Speech not attempted: voice is muted');
        return;
      }
      logDebug('info', `Speaking narrative (${sourceLabel})…`);
      try {
        speak(narr.text);
        logDebug('ok', 'speak() called without exception');
      } catch (spErr) {
        logDebug('error', `speak() threw: ${spErr.message}`);
      }
    },
    [speak, muted, speechSupported, logDebug]
  );

  const search = useCallback(
    async (ev) => {
      ev?.preventDefault?.();
      const q = query.trim();
      if (!q) {
        logDebug('warn', 'Search aborted: empty query');
        return;
      }

      logDebug('info', `Searching for "${q}" (sample ${sampleIndex})`);
      setLoading(true);
      setError(null);
      setData(null);
      setNarrative(null);
      setClickPin(null);

      try {
        const res = await regionService.inspect({
          q,
          sampleIndex: Number(sampleIndex) || 0,
        });

        setData(res);
        logDebug('ok', 'Inspect response received');

        const tasks = res?.forecast?.tasks;
        logDebug(
          tasks ? 'ok' : 'warn',
          tasks ? 'Forecast tasks present' : 'No forecast tasks returned',
          {
            has_forecast_error: !!res?.forecast_error,
            forecast_error: res?.forecast_error || null,
            task_keys: tasks ? Object.keys(tasks) : [],
            counts: {
              thunderstorm: tasks?.thunderstorm?.length ?? 0,
              cloudburst: tasks?.cloudburst?.length ?? 0,
              flash_flood: tasks?.flash_flood?.length ?? 0,
            },
          }
        );

        runNarrativeAndSpeech(res, 'search');
      } catch (e) {
        setError(e);
        logDebug('error', `Search failed: ${e.message}`, {
          code: e.code,
          status: e.status,
        });
      } finally {
        setLoading(false);
      }
    },
    [query, sampleIndex, runNarrativeAndSpeech, logDebug]
  );

  const inspectByCoords = useCallback(
    async (lat, lon) => {
      setClickPin({ lat, lon });
      setLoading(true);
      setError(null);
      setNarrative(null);

      logDebug(
        'info',
        `Map click → inspecting (${lat.toFixed(4)}, ${lon.toFixed(4)})`
      );

      try {
        const res = await regionService.inspect({
          lat,
          lon,
          sampleIndex: Number(sampleIndex) || 0,
        });

        setData(res);
        logDebug('ok', 'Click-inspect response received');
        runNarrativeAndSpeech(res, 'map click');
      } catch (e) {
        setError(e);
        logDebug('error', `Click-inspect failed: ${e.message}`, {
          code: e.code,
          status: e.status,
        });
      } finally {
        setLoading(false);
      }
    },
    [sampleIndex, runNarrativeAndSpeech, logDebug]
  );

  useEffect(() => {
    logDebug('info', 'Region Inspector mounted');
    logDebug(
      'info',
      `Speech supported: ${speechSupported ? 'yes' : 'no'} · Muted: ${muted ? 'yes' : 'no'}`
    );

    if (speechSupported) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        logDebug('info', `Voices loaded: ${voices.length}`, {
          en_IN: voices.filter((v) => v.lang === 'en-IN').map((v) => v.name),
          en_GB: voices.filter((v) => v.lang === 'en-GB').map((v) => v.name),
          en_US: voices.filter((v) => v.lang === 'en-US').map((v) => v.name),
        });
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechSupported, muted]);

  const chips = useMemo(() => buildFollowUpChips(data), [data]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: 'var(--a-text)' }}
          >
            <Sparkles size={16} style={{ color: 'var(--a-accent)' }} />
            AI Region Inspector
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
            Search a location, or click anywhere on the map. The AI reads the
            Sriya model and live weather, speaks the summary, and highlights the
            highest-risk cells.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {speechSupported && (
            <button
              onClick={() => {
                toggleMute();
                logDebug('info', muted ? 'Voice turned on' : 'Voice turned off');
              }}
              className="vn-adm-btn vn-adm-btn--outline"
              title={muted ? 'Unmute voice' : 'Mute voice'}
            >
              {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              {muted ? 'Voice off' : 'Voice on'}
            </button>
          )}
          <button
            onClick={() => setShowDebug((v) => !v)}
            className="vn-adm-btn vn-adm-btn--outline"
            title="Toggle diagnostics panel"
          >
            <Bug size={12} />
            {showDebug ? 'Hide' : 'Show'} diagnostics
          </button>
        </div>
      </div>

      {showDebug && (
        <DiagnosticsPanel
          speechSupported={speechSupported}
          muted={muted}
          log={debugLog}
          onClear={() => setDebugLog([])}
          onTestVoice={() => {
            logDebug('info', 'Manual voice test triggered');
            try {
              const u = new SpeechSynthesisUtterance(
                'Testing the AI assistant voice. One two three.'
              );
              u.rate = 1.0;
              window.speechSynthesis.speak(u);
              logDebug('ok', 'Manual test utterance queued');
            } catch (e) {
              logDebug('error', `Manual test failed: ${e.message}`);
            }
          }}
        />
      )}

      <form
        onSubmit={search}
        className="vn-adm-panel p-4 flex flex-wrap items-end gap-3"
      >
        <label className="block flex-1 min-w-[240px]">
          <span className="kpi-label">Location</span>
          <div className="mt-1 relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--a-text-faint)' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="City, district, region (e.g. Bhubaneswar)"
              className="w-full rounded pl-8 pr-3 py-2 text-sm"
              style={{
                background: 'var(--a-bg)',
                border: '1px solid var(--a-border)',
                color: 'var(--a-text)',
              }}
            />
          </div>
        </label>

        <label className="block w-32">
          <span className="kpi-label">Sample index</span>
          <input
            type="number"
            min={0}
            value={sampleIndex}
            onChange={(e) => setSampleIndex(e.target.value)}
            className="mt-1 w-full rounded px-2.5 py-2 text-sm mono"
            style={{
              background: 'var(--a-bg)',
              border: '1px solid var(--a-border)',
              color: 'var(--a-text)',
            }}
          />
        </label>

        <button
          type="submit"
          className="vn-adm-btn vn-adm-btn--primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw size={13} className="animate-spin" /> Inspecting…
            </>
          ) : (
            <>
              <Search size={13} /> Inspect
            </>
          )}
        </button>
      </form>

      {error && (
        <div
          className="vn-adm-panel p-4"
          style={{ borderLeft: '3px solid var(--a-red)' }}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} style={{ color: 'var(--a-red)' }} />
            <div>
              <div
                className="text-sm font-semibold"
                style={{ color: 'var(--a-red)' }}
              >
                Could not inspect region
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
                {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {narrative && (
        <div
          className="vn-adm-panel p-4"
          style={{
            borderLeft: `3px solid ${
              narrative.severity === 'CRIT'
                ? 'var(--a-red)'
                : narrative.severity === 'WARN'
                ? 'var(--a-orange)'
                : 'var(--a-accent)'
            }`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: 'var(--a-accent-soft)',
                color: 'var(--a-accent)',
              }}
            >
              <Sparkles size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-xs uppercase tracking-widest font-bold"
                style={{ color: 'var(--a-accent)' }}
              >
                AI Assistant
              </div>
              <p
                className="text-sm mt-1 leading-relaxed"
                style={{ color: 'var(--a-text)' }}
              >
                {narrative.text}
              </p>
              {narrative.recommendation && (
                <div
                  className="mt-2 pt-2 border-t text-xs"
                  style={{
                    borderColor: 'var(--a-border-soft)',
                    color: 'var(--a-text-mid)',
                  }}
                >
                  <strong style={{ color: 'var(--a-text)' }}>
                    Recommendation:{' '}
                  </strong>
                  {narrative.recommendation}
                </div>
              )}
            </div>
            {speechSupported && (
              <button
                onClick={() => {
                  logDebug('info', 'Replay requested');
                  speak(narrative.text);
                }}
                className="vn-adm-btn vn-adm-btn--outline shrink-0"
                title="Replay voice"
              >
                <Volume2 size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {data && chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="kpi-label mr-1">Try next</span>
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => {
                if (c.action === 'search') {
                  setQuery(c.value);
                  logDebug('info', `Chip clicked: search "${c.value}"`);
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors"
              style={{
                background: 'var(--a-surface-2)',
                color: 'var(--a-text-mid)',
                border: '1px solid var(--a-border)',
              }}
            >
              <Compass size={11} />
              {c.label}
              <ArrowRight size={10} />
            </button>
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          <div className="space-y-4">
            <div className="vn-adm-panel p-4">
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  style={{ color: 'var(--a-accent)' }}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: 'var(--a-text)' }}
                  >
                    {data.location?.short_name || data.location?.name}
                  </div>
                  <div
                    className="text-[11px] mt-0.5"
                    style={{ color: 'var(--a-text-dim)' }}
                  >
                    Lat {data.location?.latitude?.toFixed(4) ?? '—'} · Lon{' '}
                    {data.location?.longitude?.toFixed(4) ?? '—'}
                    {data.grid_cell && (
                      <>
                        {' · Grid '}
                        <span
                          className="mono"
                          style={{ color: 'var(--a-accent)' }}
                        >
                          Y{data.grid_cell.y} · X{data.grid_cell.x}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="vn-adm-panel">
              <div className="vn-adm-panel__hd">
                <span className="vn-adm-panel__title flex items-center gap-2">
                  <Layers size={12} /> AI-Highlighted Risk Map
                </span>
                <span
                  className="text-[10px] uppercase tracking-widest"
                  style={{ color: 'var(--a-text-faint)' }}
                >
                  Animated · 3 task layers
                </span>
              </div>
              <div className="p-4">
                <RegionMapLayered
                  latitude={data.location?.latitude}
                  longitude={data.location?.longitude}
                  label={data.location?.short_name || data.location?.name}
                  bounds={data.coverage?.bounds}
                  tasks={data.forecast?.tasks}
                  height={480}
                  onInspect={inspectByCoords}
                  clickPin={clickPin}
                />
              </div>
            </div>

            {data.forecast_error && (
              <div
                className="vn-adm-panel p-4"
                style={{ borderLeft: '3px solid var(--a-amber)' }}
              >
                <div className="text-xs" style={{ color: 'var(--a-amber)' }}>
                  {data.forecast_error}
                </div>
              </div>
            )}

            {data.forecast?.tasks && (
              <>
                <TaskCard
                  task="Thunderstorm"
                  horizons={data.forecast.tasks.thunderstorm}
                />
                <TaskCard
                  task="Cloudburst"
                  horizons={data.forecast.tasks.cloudburst}
                />
                <TaskCard
                  task="Flash Flood"
                  horizons={data.forecast.tasks.flash_flood}
                />
                {data.forecast.note && (
                  <div className="vn-adm-panel p-3">
                    <div className="flex items-start gap-2">
                      <Info
                        size={12}
                        style={{ color: 'var(--a-text-faint)' }}
                        className="mt-0.5"
                      />
                      <p
                        className="text-[11px]"
                        style={{ color: 'var(--a-text-faint)' }}
                      >
                        {data.forecast.note}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="space-y-4">
            <LiveWeatherCard weather={data.live_weather} />

            <PrecursorsPanel
              sampleIndex={Number(sampleIndex) || 0}
              gridCell={data.grid_cell}
            />

            <CTTPanel gridCell={data.grid_cell} />

            <ExplainPanel
              sampleIndex={Number(sampleIndex) || 0}
              gridCell={data.grid_cell}
              horizon={4}
              task="cloudburst"
            />

            <TerrainPanel
              latitude={data.location?.latitude}
              longitude={data.location?.longitude}
            />

            {data.coverage?.label && (
              <div className="vn-adm-panel p-4">
                <div className="kpi-label">Coverage region</div>
                <div
                  className="text-xs mt-1"
                  style={{ color: 'var(--a-text)' }}
                >
                  {data.coverage.label}
                </div>
                {data.coverage.bounds && (
                  <div
                    className="text-[10px] mt-1 mono"
                    style={{ color: 'var(--a-text-faint)' }}
                  >
                    [{data.coverage.bounds[0][0]}, {data.coverage.bounds[0][1]}]
                    {' → '}
                    [{data.coverage.bounds[1][0]}, {data.coverage.bounds[1][1]}]
                  </div>
                )}
              </div>
            )}

            {clickPin && (
              <div className="vn-adm-panel p-4">
                <div className="kpi-label">Last map click</div>
                <div
                  className="text-xs mt-1 mono"
                  style={{ color: 'var(--a-text)' }}
                >
                  {clickPin.lat.toFixed(4)}, {clickPin.lon.toFixed(4)}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */

function DiagnosticsPanel({
  speechSupported,
  muted,
  log,
  onClear,
  onTestVoice,
}) {
  const [expanded, setExpanded] = useState(true);

  const voices = (() => {
    if (!speechSupported) return [];
    try {
      return window.speechSynthesis.getVoices();
    } catch {
      return [];
    }
  })();

  return (
    <div
      className="vn-adm-panel"
      style={{ borderLeft: '3px solid var(--a-accent)' }}
    >
      <div className="vn-adm-panel__hd">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-left"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <span className="vn-adm-panel__title flex items-center gap-2">
            <Bug size={12} /> AI Diagnostics
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onTestVoice}
            className="vn-adm-btn vn-adm-btn--outline text-[11px]"
          >
            <Volume2 size={11} /> Test voice
          </button>
          <button
            onClick={onClear}
            className="vn-adm-btn vn-adm-btn--outline text-[11px]"
          >
            Clear log
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <Fact
              label="Speech API"
              value={speechSupported ? 'Available' : 'Unsupported'}
              ok={speechSupported}
            />
            <Fact
              label="Voice state"
              value={muted ? 'Muted' : 'On'}
              ok={!muted}
            />
            <Fact
              label="Voices installed"
              value={String(voices.length)}
              ok={voices.length > 0}
            />
            <Fact label="Page path" value={window.location.pathname} ok />
          </div>

          {voices.length > 0 && (
            <div>
              <div className="kpi-label mb-1">Available voices</div>
              <div className="flex flex-wrap gap-1.5">
                {voices.slice(0, 12).map((v) => (
                  <span
                    key={v.name}
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{
                      background: 'var(--a-surface-2)',
                      color: 'var(--a-text-dim)',
                      border: '1px solid var(--a-border)',
                    }}
                  >
                    {v.name} · {v.lang}
                  </span>
                ))}
                {voices.length > 12 && (
                  <span
                    className="text-[10px]"
                    style={{ color: 'var(--a-text-faint)' }}
                  >
                    +{voices.length - 12} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div>
            <div className="kpi-label mb-1">Event log (last {log.length})</div>
            <div
              className="rounded font-mono text-[11px] max-h-[280px] overflow-y-auto p-3 space-y-1"
              style={{
                background: 'var(--a-bg)',
                border: '1px solid var(--a-border)',
              }}
            >
              {log.length === 0 ? (
                <div style={{ color: 'var(--a-text-faint)' }}>
                  No events yet. Search a location or click the map.
                </div>
              ) : (
                [...log].reverse().map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 leading-snug">
                    <span
                      className="shrink-0"
                      style={{ color: 'var(--a-text-faint)' }}
                    >
                      {entry.time}
                    </span>
                    <span
                      className="shrink-0 uppercase text-[9px] font-bold mt-0.5"
                      style={{
                        color:
                          entry.level === 'error'
                            ? 'var(--a-red)'
                            : entry.level === 'warn'
                            ? 'var(--a-amber)'
                            : entry.level === 'ok'
                            ? 'var(--a-green)'
                            : 'var(--a-accent)',
                      }}
                    >
                      [{entry.level}]
                    </span>
                    <span style={{ color: 'var(--a-text)' }}>
                      {entry.message}
                    </span>
                    {entry.extra && (
                      <details className="ml-2">
                        <summary
                          className="cursor-pointer text-[10px]"
                          style={{ color: 'var(--a-text-faint)' }}
                        >
                          details
                        </summary>
                        <pre
                          className="mt-1 text-[10px] whitespace-pre-wrap"
                          style={{ color: 'var(--a-text-dim)' }}
                        >
                          {entry.extra}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value, ok }) {
  return (
    <div
      className="rounded p-2.5 flex items-start gap-2"
      style={{ background: 'var(--a-bg)', border: '1px solid var(--a-border)' }}
    >
      {ok ? (
        <CheckCircle2
          size={12}
          style={{ color: 'var(--a-green)' }}
          className="mt-0.5 shrink-0"
        />
      ) : (
        <XCircle
          size={12}
          style={{ color: 'var(--a-red)' }}
          className="mt-0.5 shrink-0"
        />
      )}
      <div className="min-w-0">
        <div className="kpi-label">{label}</div>
        <div
          className="text-[11px] mt-0.5 mono truncate"
          style={{ color: 'var(--a-text)' }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task, horizons }) {
  const unavailable = !horizons || horizons.length === 0;

  return (
    <div className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title">{task}</span>
        {unavailable && (
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--a-text-faint)' }}
          >
            Not available
          </span>
        )}
      </div>

      {unavailable ? (
        <div className="p-4">
          <p className="text-[11px]" style={{ color: 'var(--a-text-faint)' }}>
            This task channel is not present in the current precomputed
            predictions.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="vn-adm-table">
            <thead>
              <tr>
                <th>Horizon</th>
                <th>Risk</th>
                <th>Probability</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              {horizons.map((h) => {
                const style = SEV_COLORS[h.risk] || SEV_COLORS.LOW;
                return (
                  <tr key={h.horizon_hours}>
                    <td className="mono">+{h.horizon_hours}h</td>
                    <td>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                        style={{ background: style.bg, color: style.fg }}
                      >
                        {h.risk}
                      </span>
                    </td>
                    <td className="mono" style={{ color: 'var(--a-text)' }}>
                      {h.probability.toFixed(4)}
                    </td>
                    <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                      {h.threshold.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function buildFollowUpChips(data) {
  if (!data) return [];
  const chips = [];
  if (data.location?.short_name) {
    chips.push({
      label: 'Compare with nearby district',
      action: 'search',
      value: data.location.short_name,
    });
  }
  chips.push({
    label: 'Open Alert Queue',
    action: 'navigate',
    value: '/admin/alerts',
  });
  chips.push({
    label: 'See district analytics',
    action: 'navigate',
    value: '/admin/analytics',
  });
  return chips;
}
