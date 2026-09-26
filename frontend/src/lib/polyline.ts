import type { LngLat } from "@fa/shared";

/** Dekodiert eine Google Encoded Polyline (Präzision 5) in [lng, lat]-Punkte für MapLibre. */
export function decodePolyline(encoded: string): LngLat[] {
  const points: LngLat[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const next = () => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  while (index < encoded.length) {
    lat += next();
    lng += next();
    points.push([lng / 1e5, lat / 1e5]);
  }
  return points;
}
