const BASE = 'https://nominatim.openstreetmap.org/search';

const cache = new Map();
const inflight = new Map();

function normalize(item) {
  const bb = item.boundingbox;
  if (!bb || bb.length !== 4) return null;

  const south = parseFloat(bb[0]);
  const north = parseFloat(bb[1]);
  const west = parseFloat(bb[2]);
  const east = parseFloat(bb[3]);

  if ([south, north, west, east].some(Number.isNaN)) return null;

  return {
    id: `${item.osm_type}-${item.osm_id}`,
    displayName: item.display_name,
    shortName: (item.display_name || '').split(',')[0].trim(),
    type: item.type,
    category: item.class,
    bounds: [[south, west], [north, east]],
    center: [parseFloat(item.lat), parseFloat(item.lon)],
    importance: item.importance ?? 0,
  };
}

export const geocodeService = {
  async search(query, { limit = 6 } = {}) {
    const q = (query || '').trim();
    if (q.length < 2) return [];

    if (cache.has(q)) return cache.get(q);
    if (inflight.has(q)) return inflight.get(q);

    const params = new URLSearchParams({
      q,
      format: 'jsonv2',
      limit: String(limit),
      addressdetails: '0',
      'accept-language': 'en',
    });

    const url = `${BASE}?${params.toString()}`;

    const promise = (async () => {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
      const json = await res.json();
      const results = Array.isArray(json)
        ? json.map(normalize).filter(Boolean)
        : [];
      cache.set(q, results);
      inflight.delete(q);
      return results;
    })();

    inflight.set(q, promise);

    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Geocoding timed out')), 10000)
      ),
    ]);
  },
};