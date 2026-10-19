export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface FlightZone {
  id: string;
  name: string;
  type: 'danger' | 'restricted' | 'custom';
  /** Polygon ring as [lat, lon] pairs */
  polygon: [number, number][];
  lowerFt?: number;
  upperFt?: number;
  visible: boolean;
}

export type GearPosition = 'up' | 'down' | 'transit';

export interface AircraftState {
  lat: number;
  lon: number;
  headingDeg: number;
  trackDeg: number;
  groundSpeedKt: number;
  altitudeFt: number;
  gear: GearPosition;
}

export interface Wind {
  /** Direction the wind is coming FROM, degrees true */
  directionFromDeg: number;
  speedKt: number;
}

export interface LatLon {
  latitude: number;
  longitude: number;
}
