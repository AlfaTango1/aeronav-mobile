/**
 * Great-circle and aviation calculation helpers.
 * Conventions: angles in degrees, distances in nautical miles, speeds in knots.
 */

const EARTH_RADIUS_NM = 3440.065;

const toRad = (d: number): number => (d * Math.PI) / 180;
const toDeg = (r: number): number => (r * 180) / Math.PI;

/** Great-circle distance between two points, in NM */
export function haversineNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_NM * Math.asin(Math.sqrt(a));
}

/** Initial bearing from point 1 to point 2, degrees true (0-360) */
export function initialBearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Destination point from a start point, bearing and distance (NM) */
export function destinationPoint(
  lat: number,
  lon: number,
  bearingDeg: number,
  distanceNm: number
): [number, number] {
  const d = distanceNm / EARTH_RADIUS_NM;
  const brg = toRad(bearingDeg);
  const lat1 = toRad(lat);
  const lon1 = toRad(lon);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brg)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brg) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
  return [toDeg(lat2), ((toDeg(lon2) + 540) % 360) - 180];
}

/** Approximate a circle as a polygon ring (default 36 points) */
export function circlePolygon(lat: number, lon: number, radiusNm: number, points = 36): [number, number][] {
  const ring: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    ring.push(destinationPoint(lat, lon, (i * 360) / points, radiusNm));
  }
  return ring;
}

/**
 * Wind correction angle for a given course.
 * Positive result = steer RIGHT of course, negative = steer LEFT.
 */
export function windCorrectionAngleDeg(
  courseDeg: number,
  windFromDeg: number,
  windSpeedKt: number,
  tasKt: number
): number {
  const windToDeg = (windFromDeg + 180) % 360;
  const diff = ((courseDeg - windToDeg + 540) % 360) - 180;
  const drift = windSpeedKt * Math.sin(toRad(diff));
  const mag = toDeg(Math.asin(Math.min(1, Math.abs(drift) / Math.max(tasKt, 1))));
  return drift >= 0 ? mag : -mag;
}

/** Groundspeed from TAS, WCA and wind */
export function groundSpeedKt(
  tasKt: number,
  wcaDeg: number,
  courseDeg: number,
  windFromDeg: number,
  windSpeedKt: number
): number {
  const windToDeg = (windFromDeg + 180) % 360;
  const diff = ((courseDeg - windToDeg + 540) % 360) - 180;
  return tasKt * Math.cos(toRad(wcaDeg)) + windSpeedKt * Math.cos(toRad(diff));
}

/** Estimated time en route for a leg, in minutes */
export function legEteMinutes(distanceNm: number, gsKt: number): number {
  return gsKt > 0 ? (distanceNm / gsKt) * 60 : 0;
}

/** Fuel required for a given time */
export function fuelRequired(gph: number, hours: number): number {
  return gph * hours;
}

/** ISA temperature at altitude, °C */
export function isaTempC(altitudeFt: number): number {
  return 15 - 1.9812 * (altitudeFt / 1000);
}

/** Pressure altitude from altimeter setting, feet */
export function pressureAltitudeFt(elevationFt: number, altimeterInHg: number): number {
  return (29.92 - altimeterInHg) * 1000 + elevationFt;
}

/** Density altitude, feet */
export function densityAltitudeFt(elevationFt: number, altimeterInHg: number, oatC: number): number {
  const pAlt = pressureAltitudeFt(elevationFt, altimeterInHg);
  return pAlt + 118.8 * (oatC - isaTempC(pAlt));
}

/** True airspeed from IAS, altitude and outside air temperature (ISA model) */
export function trueAirspeedKt(iasKt: number, altitudeFt: number, oatC: number): number {
  const delta = (1 - 6.8753e-6 * altitudeFt) ** 5.2559; // pressure ratio
  const theta = (273.15 + oatC) / 288.15; // temperature ratio
  const sigma = delta / theta; // density ratio
  return iasKt / Math.sqrt(Math.max(sigma, 1e-6));
}
