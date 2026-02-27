export interface GeocodedArea {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

// Throttle: max 1 request per second (Nominatim policy)
let lastRequestTime = 0;

// Simple cache keyed by rounded coordinates (~11km buckets)
const cache = new Map<string, GeocodedArea | null>();

function cacheKey(lat: number, lng: number): string {
  return `${(lat * 10 | 0) / 10},${(lng * 10 | 0) / 10}`;
}

/**
 * Reverse geocode coordinates using Nominatim API at region level (zoom=6).
 * Throttled to 1 req/sec with coordinate-bucket cache per Nominatim usage policy.
 * Returns null on failure — caller should use coordinate fallback.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedArea | null> {
  const key = cacheKey(lat, lng);
  if (cache.has(key)) return cache.get(key)!;

  // Enforce 1 req/sec throttle
  const now = Date.now();
  const wait = Math.max(0, 1000 - (now - lastRequestTime));
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastRequestTime = Date.now();

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&zoom=6&format=json&accept-language=en`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HistoricalNarratives/1.0' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      cache.set(key, null);
      return null;
    }

    const data = await response.json();
    if (!data || data.error) {
      cache.set(key, null);
      return null;
    }

    const name = data.address?.state
      || data.address?.country
      || data.name
      || data.display_name?.split(',')[0];

    if (!name) {
      cache.set(key, null);
      return null;
    }

    const result: GeocodedArea = {
      name: String(name).slice(0, 200),
      displayName: String(data.display_name || name).slice(0, 500),
      lat,
      lng
    };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}
