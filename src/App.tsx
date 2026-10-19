import { useEffect, useRef, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import * as Location from 'expo-location';
import MapScreen from './components/MapScreen';
import InstrumentsPanel from './components/InstrumentsPanel';
import RoutePanel from './components/RoutePanel';
import ZonesPanel from './components/ZonesPanel';
import { useFlightStore } from './store/useFlightStore';
import { haversineNm, initialBearingDeg } from './lib/flightCalc';

const MS_TO_KT = 1.94384;
const M_TO_FT = 3.28084;

export default function App() {
  const simulated = useFlightStore((s) => s.simulated);
  const toggleSimulation = useFlightStore((s) => s.toggleSimulation);
  const planningEnabled = useFlightStore((s) => s.planningEnabled);
  const togglePlanning = useFlightStore((s) => s.togglePlanning);
  const setAircraft = useFlightStore((s) => s.setAircraft);
  const [gpsOn, setGpsOn] = useState(false);
  const simRef = useRef({ legIndex: 0, progress: 0 });

  // --- Real GPS position (expo-location) ---
  useEffect(() => {
    if (!gpsOn) return;
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for GPS mode.');
        setGpsOn(false);
        return;
      }
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 3 },
        (loc) => {
          if (cancelled) return;
          setAircraft({
            lat: loc.coords.latitude,
            lon: loc.coords.longitude,
            groundSpeedKt: (loc.coords.speed ?? 0) * MS_TO_KT,
            trackDeg: loc.coords.heading ?? useFlightStore.getState().aircraft.trackDeg,
            altitudeFt: (loc.coords.altitude ?? 0) * M_TO_FT,
          });
        }
      );
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsOn]);

  // --- Flight simulator: fly the route legs at the current groundspeed ---
  useEffect(() => {
    if (!simulated) return;
    const id = setInterval(() => {
      const { aircraft, waypoints } = useFlightStore.getState();
      if (waypoints.length < 2) return;
      if (simRef.current.legIndex >= waypoints.length - 1) {
        simRef.current = { legIndex: 0, progress: 0 }; // loop the route
      }
      const from = waypoints[simRef.current.legIndex];
      const to = waypoints[simRef.current.legIndex + 1];
      const dist = Math.max(haversineNm(from.lat, from.lon, to.lat, to.lon), 0.001);
      simRef.current.progress += aircraft.groundSpeedKt / 3600 / dist;
      if (simRef.current.progress >= 1) {
        simRef.current = { legIndex: simRef.current.legIndex + 1, progress: 0 };
        return;
      }
      const p = simRef.current.progress;
      const hdg = initialBearingDeg(from.lat, from.lon, to.lat, to.lon);
      setAircraft({
        lat: from.lat + (to.lat - from.lat) * p,
        lon: from.lon + (to.lon - from.lon) * p,
        headingDeg: hdg,
        trackDeg: hdg,
      });
    }, 1000);
    return () => clearInterval(id);
  }, [simulated, setAircraft]);

  const follow = simulated || gpsOn;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>AeroNav</Text>
        <TouchableOpacity
          style={[styles.headerBtn, planningEnabled && styles.headerBtnActive]}
          onPress={togglePlanning}
        >
          <Text style={styles.headerBtnText}>Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerBtn, simulated && styles.headerBtnActive]}
          onPress={toggleSimulation}
        >
          <Text style={styles.headerBtnText}>{simulated ? '■ Sim' : '▶ Sim'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerBtn, gpsOn && styles.headerBtnActive]}
          onPress={() => setGpsOn((v) => !v)}
        >
          <Text style={styles.headerBtnText}>{gpsOn ? '■ GPS' : '● GPS'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapScreen follow={follow} />
      </View>

      <ScrollView style={styles.panels} keyboardShouldPersistTaps="handled">
        <InstrumentsPanel />
        <RoutePanel />
        <ZonesPanel />
        <Text style={styles.disclaimer}>Training / simulation only — NOT for real navigation.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#161b22',
  },
  title: {
    color: '#e6edf3',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 'auto',
  },
  headerBtn: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBtnActive: {
    backgroundColor: '#1f3a5f',
    borderColor: '#58a6ff',
  },
  headerBtnText: {
    color: '#e6edf3',
    fontSize: 13,
  },
  mapContainer: {
    flex: 1.4,
    minHeight: 220,
  },
  panels: {
    flex: 1,
    padding: 8,
  },
  disclaimer: {
    color: '#f85149',
    fontSize: 11,
    textAlign: 'center',
    marginVertical: 8,
  },
});
