import { useEffect, useState } from 'react';
import { 
  MapPin, 
  AlertTriangle, 
  Search, 
  CloudRain, 
  Wind, 
  Droplets, 
  Navigation, 
  RefreshCw, 
  Compass, 
  Eye, 
  Thermometer 
} from 'lucide-react';
import LeafletMap from '../../components/map/LeafletMap';
import HorizonTabs from '../../components/map/HorizonTabs';
import CoverageBoundsForm from '../../components/map/CoverageBoundsForm';
import { forecastService } from '../../services/forecastService';
import { coverageApi, loadMirror, saveMirror } from '../../utils/coverage';
import { HORIZONS } from '../../utils/constants';

// OpenWeather Configuration (reads from .env or defaults to provided key)
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '2746329ec842b85e524afdd07b1e3bac';
const OPENWEATHER_BASE_URL = import.meta.env.VITE_OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

export default function CitizenMap() {
  const [coverage, setCoverage] = useState(() => loadMirror());
  const [horizon, setHorizon] = useState(HORIZONS[0]);
  const [latest, setLatest] = useState(null);
  const [spatial, setSpatial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // OpenWeather State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  // Load mirror coverage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await coverageApi.get();
        if (cancelled) return;
        if (s?.bounds) {
          setCoverage(s);
          saveMirror(s);
        }
      } catch {
        // Fallback to mirror storage
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch Latest Forecast ID
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await forecastService.latest();
        if (!cancelled) setLatest(data);
      } catch {
        if (!cancelled) setLatest(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch Spatial Radar Grid Data
  useEffect(() => {
    const id = latest?.forecast_id;
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await forecastService.spatial(id, horizon, 1);
        if (!cancelled) setSpatial(data);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [latest?.forecast_id, horizon]);

  // Initial OpenWeather fetch on mount (Default: Bhubaneswar, Odisha)
  useEffect(() => {
    fetchWeatherByCoords(20.2961, 85.8245, 'Bhubaneswar, Odisha');
  }, []);

  // Fetch OpenWeather Telemetry & Update Map Bounds
  const fetchWeatherByCoords = async (lat, lon, label) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const res = await fetch(
        `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      if (!res.ok) throw new Error('Failed to retrieve live weather telemetry.');
      const data = await res.json();

      const displayName = label || `${data.name}, ${data.sys?.country || ''}`;
      setWeatherData({ ...data, displayName });

      // Create a ~50km coverage area around coordinates
      const offset = 0.45;
      const newBounds = [
        [lat - offset, lon - offset],
        [lat + offset, lon + offset]
      ];

      const newCoverage = {
        label: displayName,
        bounds: newBounds
      };

      setCoverage(newCoverage);
      saveMirror(newCoverage);
    } catch (err) {
      setWeatherError(err.message);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Handle Location Search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      const geoData = await geoRes.json();

      if (!geoData || geoData.length === 0) {
        throw new Error(`Location "${searchQuery}" could not be found.`);
      }

      const { lat, lon, name, state, country } = geoData[0];
      const label = `${name}${state ? `, ${state}` : ''}, ${country}`;
      await fetchWeatherByCoords(lat, lon, label);
    } catch (err) {
      setWeatherError(err.message);
      setWeatherLoading(false);
    }
  };

  // Handle GPS Auto-Detect
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setWeatherError('Geolocation is not supported by your browser.');
      return;
    }
    setWeatherLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude, 'Your GPS Location');
      },
      () => {
        setWeatherError('Location permission denied.');
        setWeatherLoading(false);
      }
    );
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* ── Search & Header Section ── */}
      <section className="vn-panel p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 mb-2">
              <Compass size={13} className="text-blue-600 animate-spin" />
              Live Nowcasting & Spatial Radar
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--vn-primary)' }}>
              Risk Map & Location Telemetry
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Search any district or city to check live OpenWeather atmospheric telemetry overlaid with VajraNetra AI predictions.
            </p>
          </div>

          {/* Search Bar Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 min-w-[280px] sm:min-w-[400px]">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city/district (e.g. Bhubaneswar, Khordha)"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={weatherLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {weatherLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
              <span>Analyze</span>
            </button>

            <button
              type="button"
              onClick={handleUseGPS}
              title="Use current GPS location"
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
            >
              <Navigation size={15} className="text-blue-600" />
            </button>
          </form>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider">Quick Presets:</span>
          {['Bhubaneswar', 'Khordha', 'Cuttack', 'Puri', 'Balasore'].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => { setSearchQuery(city); fetchWeatherByCoords(0, 0, city); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      </section>

      {/* ── OpenWeather Nowcast Live Telemetry Widget ── */}
      {weatherLoading && (
        <div className="vn-panel p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin text-blue-600" />
          <span>Fetching live weather telemetry from station...</span>
        </div>
      )}

      {weatherError && (
        <div className="vn-panel p-4 bg-red-50 border-l-4 border-red-500 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600 shrink-0" />
          <span>Weather Alert: {weatherError}</span>
        </div>
      )}

      {weatherData && !weatherLoading && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-blue-400" />
              <span className="text-sm font-bold text-slate-200">{weatherData.displayName}</span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt={weatherData.weather[0].description}
                className="w-16 h-16 -my-2"
              />
              <div>
                <div className="text-3xl font-black">{Math.round(weatherData.main.temp)}°C</div>
                <div className="text-xs text-slate-300 capitalize font-medium">
                  {weatherData.weather[0].description}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Feels like {Math.round(weatherData.main.feels_like)}°C • Pressure: {weatherData.main.pressure} hPa
            </p>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <Droplets size={18} className="mx-auto text-blue-400 mb-1" />
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Humidity</span>
              <span className="text-xs font-bold text-slate-100">{weatherData.main.humidity}%</span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <Wind size={18} className="mx-auto text-cyan-400 mb-1" />
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Wind Speed</span>
              <span className="text-xs font-bold text-slate-100">{weatherData.wind.speed} m/s</span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <CloudRain size={18} className="mx-auto text-indigo-400 mb-1" />
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Rain Volume</span>
              <span className="text-xs font-bold text-slate-100">{weatherData.rain ? `${weatherData.rain['1h']} mm` : '0 mm'}</span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <Eye size={18} className="mx-auto text-emerald-400 mb-1" />
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Visibility</span>
              <span className="text-xs font-bold text-slate-100">{(weatherData.visibility / 1000).toFixed(1)} km</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Coverage Bounds Form Fallback ── */}
      {!coverage && (
        <section className="vn-panel p-6">
          <h2 className="font-semibold text-slate-800 mb-3">
            Select an area to view on the map
          </h2>
          <CoverageBoundsForm onSaved={setCoverage} gridShape={[120, 163]} />
        </section>
      )}

      {/* ── Leaflet Spatial Radar Map ── */}
      {coverage && (
        <>
          <section className="vn-panel">
            <div className="vn-panel__hd">
              <div className="vn-panel__title flex items-center gap-2">
                <MapPin size={14} /> {coverage.label || 'Selected area'}
              </div>
              <HorizonTabs value={horizon} onChange={setHorizon} />
            </div>
            <div className="p-4">
              {loading && (
                <div className="h-[540px] flex items-center justify-center text-slate-500 text-sm">
                  Loading map…
                </div>
              )}
              {!loading && error && (
                <div className="h-[540px] flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <AlertTriangle size={24} className="mx-auto" style={{ color: 'var(--vn-red)' }} />
                    <p className="mt-2 text-sm text-slate-700">Could not load the map.</p>
                    <p className="text-xs text-slate-500 mt-1">{error.message}</p>
                  </div>
                </div>
              )}
              {!loading && !error && spatial && (
                <LeafletMap
                  bounds={coverage.bounds}
                  label="Model grid · placed over selected region"
                  grid={spatial.grid}
                  threshold={Number(spatial.threshold)}
                  peakCell={spatial.peak_grid}
                  horizon={horizon}
                  maxProbability={Number(spatial.max_probability || 0)}
                  height={540}
                />
              )}
            </div>
          </section>

          <p className="text-xs text-slate-500">
            The map shows model output on the 120 × 163 grid. Placement is dynamically adjusted using OpenWeather geocoding and selected coverage coordinates.
          </p>
        </>
      )}

    </div>
  );
}