import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFlightStore } from '../store/useFlightStore';
import {
  fuelRequired,
  groundSpeedKt,
  haversineNm,
  initialBearingDeg,
  legEteMinutes,
  windCorrectionAngleDeg,
} from '../lib/flightCalc';

const fmtHhMm = (minutes: number): string =>
  Math.floor(minutes / 60) + ':' + String(Math.round(minutes % 60)).padStart(2, '0');

interface LegRow {
  toId: string;
  label: string;
  distanceNm: number;
  bearingDeg: number;
  wcaDeg: number;
  gsKt: number;
  eteMin: number;
}

function NumInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={String(value)}
        onChangeText={(t) => onChange(parseFloat(t) || 0)}
      />
    </View>
  );
}

export default function RoutePanel() {
  const waypoints = useFlightStore((s) => s.waypoints);
  const wind = useFlightStore((s) => s.wind);
  const tasKt = useFlightStore((s) => s.tasKt);
  const fuelFlowGph = useFlightStore((s) => s.fuelFlowGph);
  const setWind = useFlightStore((s) => s.setWind);
  const setTas = useFlightStore((s) => s.setTas);
  const setFuelFlow = useFlightStore((s) => s.setFuelFlow);
  const clearRoute = useFlightStore((s) => s.clearRoute);
  const removeWaypoint = useFlightStore((s) => s.removeWaypoint);

  const legs: LegRow[] = useMemo(() => {
    const rows: LegRow[] = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      const distanceNm = haversineNm(from.lat, from.lon, to.lat, to.lon);
      const bearingDeg = initialBearingDeg(from.lat, from.lon, to.lat, to.lon);
      const wcaDeg = windCorrectionAngleDeg(bearingDeg, wind.directionFromDeg, wind.speedKt, tasKt);
      const gsKt = groundSpeedKt(tasKt, wcaDeg, bearingDeg, wind.directionFromDeg, wind.speedKt);
      rows.push({
        toId: to.id,
        label: `${from.name} → ${to.name}`,
        distanceNm,
        bearingDeg,
        wcaDeg,
        gsKt,
        eteMin: legEteMinutes(distanceNm, gsKt),
      });
    }
    return rows;
  }, [waypoints, wind, tasKt]);

  const totalNm = legs.reduce((s, l) => s + l.distanceNm, 0);
  const totalMin = legs.reduce((s, l) => s + l.eteMin, 0);
  const fuel = fuelRequired(fuelFlowGph, totalMin / 60);

  return (
    <View style={styles.panel}>
      <Text style={styles.h2}>ROUTE PLAN</Text>

      <View style={styles.inputsRow}>
        <NumInput label="TAS kt" value={tasKt} onChange={setTas} />
        <NumInput label="Wind °" value={wind.directionFromDeg} onChange={(v) => setWind({ ...wind, directionFromDeg: v })} />
        <NumInput label="Wind kt" value={wind.speedKt} onChange={(v) => setWind({ ...wind, speedKt: v })} />
        <NumInput label="FF gph" value={fuelFlowGph} onChange={setFuelFlow} />
      </View>

      <ScrollView style={styles.tableScroll} nestedScrollEnabled>
        {legs.length === 0 ? (
          <Text style={styles.hint}>Tap the map (with "Plan" on) to add waypoints.</Text>
        ) : (
          legs.map((l) => (
            <View key={l.toId} style={styles.legRow}>
              <Text style={styles.legLabel} numberOfLines={1}>
                {l.label}
              </Text>
              <Text style={styles.legData}>
                {l.distanceNm.toFixed(1)} NM · {String(Math.round(l.bearingDeg)).padStart(3, '0')}° · GS{' '}
                {Math.round(l.gsKt)} · {fmtHhMm(l.eteMin)}
              </Text>
              <TouchableOpacity onPress={() => removeWaypoint(l.toId)}>
                <Text style={styles.remove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Text style={styles.totals}>
        Total: {totalNm.toFixed(1)} NM · ETE {Math.floor(totalMin / 60)}h {Math.round(totalMin % 60)}m ·{' '}
        {fuel.toFixed(1)} gal
      </Text>

      <TouchableOpacity style={styles.btn} onPress={clearRoute} disabled={waypoints.length === 0}>
        <Text style={styles.btnText}>Clear route</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#161b22',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  h2: {
    color: '#58a6ff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inputLabel: {
    color: '#8b949e',
    fontSize: 11,
  },
  input: {
    backgroundColor: '#0d1117',
    color: '#e6edf3',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 6,
    width: 56,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 12,
  },
  tableScroll: {
    maxHeight: 130,
    marginTop: 6,
  },
  legRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  legLabel: {
    color: '#e6edf3',
    fontSize: 12,
    flex: 1,
  },
  legData: {
    color: '#8b949e',
    fontSize: 11,
  },
  remove: {
    color: '#f85149',
    fontSize: 14,
    paddingHorizontal: 4,
  },
  totals: {
    color: '#3fb950',
    fontSize: 12,
    marginVertical: 8,
  },
  hint: {
    color: '#8b949e',
    fontSize: 12,
    paddingVertical: 4,
  },
  btn: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#e6edf3',
    fontSize: 12,
  },
});
