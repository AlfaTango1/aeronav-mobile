import { create } from 'zustand';
import type { AircraftState, FlightZone, GearPosition, Waypoint, Wind } from '../types';

let idCounter = 0;
const nextId = (): string => `id-${++idCounter}-${Date.now().toString(36)}`;

export interface FlightStore {
  aircraft: AircraftState;
  waypoints: Waypoint[];
  zones: FlightZone[];
  wind: Wind;
  tasKt: number;
  fuelFlowGph: number;
  planningEnabled: boolean;
  simulated: boolean;

  setAircraft: (patch: Partial<AircraftState>) => void;
  setGear: (gear: GearPosition) => void;
  addWaypoint: (w: Omit<Waypoint, 'id'>) => void;
  removeWaypoint: (id: string) => void;
  clearRoute: () => void;
  addZone: (z: Omit<FlightZone, 'id'>) => void;
  toggleZone: (id: string) => void;
  removeZone: (id: string) => void;
  setWind: (w: Wind) => void;
  setTas: (v: number) => void;
  setFuelFlow: (v: number) => void;
  togglePlanning: () => void;
  toggleSimulation: () => void;
}

export const useFlightStore = create<FlightStore>((set) => ({
  aircraft: {
    lat: 51.47,
    lon: -0.45,
    headingDeg: 90,
    trackDeg: 90,
    groundSpeedKt: 120,
    altitudeFt: 3000,
    gear: 'down',
  },
  waypoints: [],
  zones: [],
  wind: { directionFromDeg: 270, speedKt: 10 },
  tasKt: 120,
  fuelFlowGph: 10,
  planningEnabled: true,
  simulated: false,

  setAircraft: (patch) => set((s) => ({ aircraft: { ...s.aircraft, ...patch } })),
  setGear: (gear) => set((s) => ({ aircraft: { ...s.aircraft, gear } })),
  addWaypoint: (w) =>
    set((s) => ({
      waypoints: [...s.waypoints, { ...w, id: nextId(), name: w.name || `WP${s.waypoints.length + 1}` }],
    })),
  removeWaypoint: (id) => set((s) => ({ waypoints: s.waypoints.filter((w) => w.id !== id) })),
  clearRoute: () => set({ waypoints: [] }),
  addZone: (z) => set((s) => ({ zones: [...s.zones, { ...z, id: nextId() }] })),
  toggleZone: (id) =>
    set((s) => ({ zones: s.zones.map((z) => (z.id === id ? { ...z, visible: !z.visible } : z)) })),
  removeZone: (id) => set((s) => ({ zones: s.zones.filter((z) => z.id !== id) })),
  setWind: (wind) => set({ wind }),
  setTas: (tasKt) => set({ tasKt }),
  setFuelFlow: (fuelFlowGph) => set({ fuelFlowGph }),
  togglePlanning: () => set((s) => ({ planningEnabled: !s.planningEnabled })),
  toggleSimulation: () => set((s) => ({ simulated: !s.simulated })),
}));
