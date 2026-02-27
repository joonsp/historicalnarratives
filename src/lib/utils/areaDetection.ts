import L from 'leaflet';
import { reverseGeocode } from './reverseGeocode';

export interface DetectedArea {
  name: string;
  source: 'border' | 'geocode' | 'coordinates';
  lat: number;
  lng: number;
  borderYear?: number;
  modernName?: string;
}

/**
 * Detect area name from a map click point.
 * 1. Check loaded border GeoJSON layers for historical names
 * 2. Fall back to Nominatim reverse geocoding
 * 3. Final fallback: coordinate string
 */
export async function detectArea(
  latlng: L.LatLng,
  borderLayers: L.GeoJSON[]
): Promise<DetectedArea> {
  const { lat, lng } = latlng;

  // 1. Check border layers for a feature containing this point
  for (const layer of borderLayers) {
    const match = findFeatureAtPoint(layer, latlng);
    if (match) {
      // Also try geocode for modern name (non-blocking)
      const geocoded = await reverseGeocode(lat, lng).catch(() => null);
      return {
        name: match.name,
        source: 'border',
        lat,
        lng,
        borderYear: match.year,
        modernName: geocoded?.name
      };
    }
  }

  // 2. Reverse geocoding fallback
  const geocoded = await reverseGeocode(lat, lng);
  if (geocoded) {
    return {
      name: geocoded.name,
      source: 'geocode',
      lat,
      lng
    };
  }

  // 3. Coordinate string fallback
  return {
    name: `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(1)}°${lng >= 0 ? 'E' : 'W'}`,
    source: 'coordinates',
    lat,
    lng
  };
}

function findFeatureAtPoint(
  geoJsonLayer: L.GeoJSON,
  latlng: L.LatLng
): { name: string; year?: number } | null {
  let result: { name: string; year?: number } | null = null;

  geoJsonLayer.eachLayer((sublayer) => {
    if (result) return; // already found
    const feature = (sublayer as any).feature;
    if (!feature?.properties?.name) return;

    // Check if the layer's bounds contain the point (fast check)
    const bounded = sublayer as L.Polygon;
    if (bounded.getBounds?.().contains(latlng)) {
      result = {
        name: feature.properties.name,
        year: feature.properties.year
      };
    }
  });

  return result;
}
