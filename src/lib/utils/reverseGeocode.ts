export interface GeocodedArea {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

/**
 * Reverse geocode coordinates using Nominatim API at region level (zoom=6).
 * Returns null on failure — caller should use coordinate fallback.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedArea | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&zoom=6&format=json&accept-language=en`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HistoricalNarratives/1.0' }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.error) return null;

    const name = data.address?.state
      || data.address?.country
      || data.name
      || data.display_name?.split(',')[0];

    if (!name) return null;

    return {
      name,
      displayName: data.display_name || name,
      lat,
      lng
    };
  } catch {
    return null;
  }
}
