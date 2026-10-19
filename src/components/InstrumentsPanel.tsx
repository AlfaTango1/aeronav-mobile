import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFlightStore } from '../store/useFlightStore';

const pad3 = (n: number): string => String(Math.round(n) % 360).padStart(3, '0');

function Lamp({ label, color, on }: { label: string; color: string; on: boolean }) {
  return (
    <View
      style={[
        styles.lamp,
        on && { backgroundColor: color, borderColor: color, shadowColor: color, shadowOpacity: 0.9, shadowRadius: 12, elevation: 6 },
      ]}
    >
      <Text style={[styles.lampText, on && { color: '#fff' }]}>{label}</Text>
    </View>
  );
}

export default function InstrumentsPanel() {
  const aircraft = useFlightStore((s) => s.aircraft);
  const setGear = useFlightStore((s) => s.setGear);

  return (
    <View style={styles.panel}>
      <Text style={styles.h2}>AIRCRAFT</Text>

      <View style={styles.instrGrid}>
        <View style={styles.instrBox}>
          <Text style={styles.instrLabel}>GS</Text>
          <Text style={styles.instrValue}>{Math.round(aircraft.groundSpeedKt)} kt</Text>
        </View>
        <View style={styles.instrBox}>
          <Text style={styles.instrLabel}>ALT</Text>
          <Text style={styles.instrValue}>{Math.round(aircraft.altitudeFt)} ft</Text>
        </View>
        <View style={styles.instrBox}>
          <Text style={styles.instrLabel}>HDG</Text>
          <Text style={styles.instrValue}>{pad3(aircraft.headingDeg)}°</Text>
        </View>
      </View>

      <Text style={styles.h3}>Gear position</Text>
      <View style={styles.lampRow}>
        <Lamp label="UP" color="#da3633" on={aircraft.gear === 'up'} />
        <Lamp label="TRANSIT" color="#f0883e" on={aircraft.gear === 'transit'} />
        <Lamp label="DOWN" color="#3fb950" on={aircraft.gear === 'down'} />
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btn} onPress={() => setGear('up')}>
          <Text style={styles.btnText}>Gear UP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => setGear('transit')}>
          <Text style={styles.btnText}>Transit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => setGear('down')}>
          <Text style={styles.btnText}>Gear DOWN</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Simulated indication. Real gear data requires aircraft-system input (GDL-90/Stratux).
      </Text>
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
  h3: {
    color: '#e6edf3',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 6,
  },
  instrGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  instrBox: {
    flex: 1,
    backgroundColor: '#0d1117',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  instrLabel: {
    color: '#8b949e',
    fontSize: 10,
  },
  instrValue: {
    color: '#e6edf3',
    fontSize: 14,
    fontWeight: '600',
  },
  lampRow: {
    flexDirection: 'row',
    gap: 8,
  },
  lamp: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#30363d',
  },
  lampText: {
    color: '#484f58',
    fontSize: 11,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  btn: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  btnText: {
    color: '#e6edf3',
    fontSize: 12,
  },
  hint: {
    color: '#8b949e',
    fontSize: 11,
    marginTop: 6,
  },
});
