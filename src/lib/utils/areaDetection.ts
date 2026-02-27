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
 * 1. Check loaded border GeoJSON layers for historical names (point-in-polygon)
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
      // Fire-and-forget geocode for modern name — don't block the dialog
      const result: DetectedArea = {
        name: match.name,
        source: 'border',
        lat,
        lng,
        borderYear: match.year
      };
      // Enrich with modern name asynchronously (caller gets result immediately)
      reverseGeocode(lat, lng).then(geocoded => {
        if (geocoded) result.modernName = geocoded.name;
      }).catch(() => {});
      return result;
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
    name: `${Math.abs(lat).toFixed(1)}\u00B0${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(1)}\u00B0${lng >= 0 ? 'E' : 'W'}`,
    source: 'coordinates',
    lat,
    lng
  };
}

/**
 * Ray-casting point-in-polygon test for a single ring.
 */
function pointInRing(point: [number, number], ring: L.LatLng[]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].lat, yi = ring[i].lng;
    const xj = ring[j].lat, yj = ring[j].lng;
    if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Test if a point is inside a Leaflet polygon or multi-polygon layer.
 */
function isPointInLayer(latlng: L.LatLng, sublayer: L.Layer): boolean {
  const point: [number, number] = [latlng.lat, latlng.lng];

  // L.Polygon has getLatLngs() returning LatLng[][] (outer + holes)
  if (typeof (sublayer as any).getLatLngs === 'function') {
    const latLngs = (sublayer as L.Polygon).getLatLngs();
    if (!latLngs || latLngs.length === 0) return false;

    // getLatLngs() returns LatLng[] for simple, LatLng[][] for polygon, LatLng[][][] for multi
    const first = latLngs[0];
    if (Array.isArray(first) && Array.isArray((first as any)[0])) {
      // MultiPolygon: LatLng[][][]
      for (const polygon of latLngs as L.LatLng[][]) {
        if (pointInRing(point, polygon as unknown as L.LatLng[])) return true;
      }
      return false;
    } else if (Array.isArray(first)) {
      // Polygon with holes: outer ring is first element
      return pointInRing(point, first as L.LatLng[]);
    } else {
      // Simple polygon: LatLng[]
      return pointInRing(point, latLngs as L.LatLng[]);
    }
  }

  // FeatureGroup (MultiPolygon can become this) — check child layers
  if (typeof (sublayer as any).eachLayer === 'function') {
    let found = false;
    (sublayer as L.FeatureGroup).eachLayer((child) => {
      if (!found && isPointInLayer(latlng, child)) found = true;
    });
    return found;
  }

  return false;
}

function findFeatureAtPoint(
  geoJsonLayer: L.GeoJSON,
  latlng: L.LatLng
): { name: string; year?: number } | null {
  let result: { name: string; year?: number } | null = null;

  geoJsonLayer.eachLayer((sublayer) => {
    if (result) return;
    const feature = (sublayer as any).feature;
    if (!feature?.properties?.name) return;

    // Quick bounding-box pre-filter, then accurate point-in-polygon
    const bounds = (sublayer as any).getBounds?.();
    if (!bounds || !bounds.contains(latlng)) return;

    if (isPointInLayer(latlng, sublayer)) {
      result = {
        name: feature.properties.name,
        year: feature.properties.year
      };
    }
  });

  return result;
}
