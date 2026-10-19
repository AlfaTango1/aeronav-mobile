import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, Polygon, UrlTile } from 'react-native-maps';
import Constants from 'expo-constants';
import { useFlightStore } from '../store/useFlightStore';
import type { LatLon } from '../types';

const zoneColor = (t: string) => (t === 'danger' ? '#e33' : t === 'restricted' ? '#e90' : '#a6e');
// On Android builds without a Google Maps key, draw OpenStreetMap tiles instead.
const USE_OSM =
  Platform.OS === 'android' && Boolean(Constants.expoConfig?.extra?.useOsmTiles);

const withAlpha = (hex: string, alpha: string) => hex + alpha;

interface Props {
  /** Keep the map centered on the aircraft (used while simulating / GPS tracking) */
  follow: boolean;
}

export default function MapScreen({ follow }: Props) {
  const aircraft = useFlightStore((s) => s.aircraft);
  const waypoints = useFlightStore((s) => s.waypoints);
  const zones = useFlightStore((s) => s.zones);
  const planningEnabled = useFlightStore((s) => s.planningEnabled);
  const addWaypoint = useFlightStore((s) => s.addWaypoint);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!follow) return;
    mapRef.current?.animateToRegion(
      {
        latitude: aircraft.lat,
        longitude: aircraft.lon,
        latitudeDelta: 0.35,
        longitudeDelta: 0.35,
      },
      500
    );
  }, [aircraft.lat, aircraft.lon, follow]);

  const routeCoords: LatLon[] = waypoints.map((w) => ({ latitude: w.lat, longitude: w.lon }));

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      mapType={USE_OSM ? 'none' : 'standard'}
      initialRegion={{
        latitude: 51.47,
        longitude: -0.45,
        latitudeDelta: 0.9,
        longitudeDelta: 0.9,
      }}
      onPress={(e) => {
        if (!planningEnabled) return;
        const { latitude, longitude } = e.nativeEvent.coordinate;
        addWaypoint({ name: '', lat: latitude, lon: longitude });
      }}
    >
      {USE_OSM && (
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={-1}
        />
      )}

      {/* Ownship: rotated aircraft symbol */}
      <Marker
        coordinate={{ latitude: aircraft.lat, longitude: aircraft.lon }}
        anchor={{ x: 0.5, y: 0.5 }}
        flat
      >
        <Text
          style={[
            styles.ownship,
            { transform: [{ rotate: `${aircraft.headingDeg}deg` }] },
          ]}
        >
          ➤
        </Text>
      </Marker>

      {routeCoords.length > 1 && (
        <Polyline coordinates={routeCoords} strokeColor="#0af" strokeWidth={3} />
      )}

      {waypoints.map((w, i) => (
        <Marker
          key={w.id}
          coordinate={{ latitude: w.lat, longitude: w.lon }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.waypoint}>
            <Text style={styles.waypointText}>{w.name || `WP${i + 1}`}</Text>
          </View>
        </Marker>
      ))}

      {zones
        .filter((z) => z.visible)
        .map((z) => (
          <Polygon
            key={z.id}
            coordinates={z.polygon.map(([lat, lon]) => ({ latitude: lat, longitude: lon }))}
            strokeColor={zoneColor(z.type)}
            fillColor={withAlpha(zoneColor(z.type), '22')}
            strokeWidth={2}
          />
        ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  ownship: {
    fontSize: 30,
    color: '#00e5ff',
    textShadowColor: '#00e5ff',
    textShadowRadius: 6,
  },
  waypoint: {
    backgroundColor: '#0af',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  waypointText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
