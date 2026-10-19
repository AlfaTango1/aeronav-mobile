import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFlightStore } from '../store/useFlightStore';
import { circlePolygon } from '../lib/flightCalc';

export default function ZonesPanel() {
  const zones = useFlightStore((s) => s.zones);
  const addZone = useFlightStore((s) => s.addZone);
  const toggleZone = useFlightStore((s) => s.toggleZone);
  const removeZone = useFlightStore((s) => s.removeZone);
  const aircraft = useFlightStore((s) => s.aircraft);

  const [name, setName] = useState('');
  const [type, setType] = useState<'danger' | 'restricted' | 'custom'>('danger');
  const [lat, setLat] = useState('51.5000');
  const [lon, setLon] = useState('-0.6000');
  const [radiusNm, setRadiusNm] = useState('5');
  const [lowerFt, setLowerFt] = useState('');
  const [upperFt, setUpperFt] = useState('');

  const submit = () => {
    addZone({
      name: name.trim() || 'New zone',
      type,
      polygon: circlePolygon(parseFloat(lat) || 0, parseFloat(lon) || 0, parseFloat(radiusNm) || 1),
      lowerFt: lowerFt === '' ? undefined : parseFloat(lowerFt),
      upperFt: upperFt === '' ? undefined : parseFloat(upperFt),
      visible: true,
    });
    setName('');
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.h2}>FLIGHT ZONES</Text>

      <TextInput
        style={[styles.input, styles.fullWidth]}
        placeholder="Zone name"
        placeholderTextColor="#484f58"
        value={name}
        onChangeText={setName}
      />

      <View style={styles.btnRow}>
        {(['danger', 'restricted', 'custom'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.btn, type === t && styles.btnActive]}
            onPress={() => setType(t)}
          >
            <Text style={styles.btnText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.btnRow}>
        <TextInput style={styles.input} keyboardType="numeric" value={lat} onChangeText={setLat} placeholder="lat" placeholderTextColor="#484f58" />
        <TextInput style={styles.input} keyboardType="numeric" value={lon} onChangeText={setLon} placeholder="lon" placeholderTextColor="#484f58" />
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            setLat(aircraft.lat.toFixed(4));
            setLon(aircraft.lon.toFixed(4));
          }}
        >
          <Text style={styles.btnText}>Aircraft pos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.btnRow}>
        <TextInput style={styles.input} keyboardType="numeric" value={radiusNm} onChangeText={setRadiusNm} placeholder="r NM" placeholderTextColor="#484f58" />
        <TextInput style={styles.input} keyboardType="numeric" value={lowerFt} onChangeText={setLowerFt} placeholder="low ft" placeholderTextColor="#484f58" />
        <TextInput style={styles.input} keyboardType="numeric" value={upperFt} onChangeText={setUpperFt} placeholder="up ft" placeholderTextColor="#484f58" />
      </View>

      <TouchableOpacity style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>Add zone</Text>
      </TouchableOpacity>

      {zones.map((z) => (
        <View key={z.id} style={styles.zoneRow}>
          <Switch value={z.visible} onValueChange={() => toggleZone(z.id)} />
          <Text style={styles.zoneName} numberOfLines={1}>
            {z.name} <Text style={styles.zoneMeta}>({z.type})</Text>
            {z.lowerFt != null && (
              <Text style={styles.zoneMeta}>
                {' '}
                {z.lowerFt}–{z.upperFt ?? '∞'} ft
              </Text>
            )}
          </Text>
          <TouchableOpacity onPress={() => removeZone(z.id)}>
            <Text style={styles.remove}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
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
  input: {
    backgroundColor: '#0d1117',
    color: '#e6edf3',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 6,
    width: 84,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 12,
  },
  fullWidth: {
    width: '100%',
    marginBottom: 6,
  },
  btnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  btn: {
    backgroundColor: '#21262d',
    borderWidth: 1,
    borderColor: '#30363d',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  btnActive: {
    backgroundColor: '#1f3a5f',
    borderColor: '#58a6ff',
  },
  btnText: {
    color: '#e6edf3',
    fontSize: 12,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  zoneName: {
    color: '#e6edf3',
    fontSize: 13,
    flex: 1,
  },
  zoneMeta: {
    color: '#8b949e',
    fontSize: 11,
  },
  remove: {
    color: '#f85149',
    fontSize: 14,
    paddingHorizontal: 4,
  },
});
