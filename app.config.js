// Expo config. GOOGLE_MAPS_API_KEY is optional: without it the Android build
// shows OpenStreetMap tiles instead of Google base maps.
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

module.exports = {
  expo: {
    name: 'AeroNav',
    slug: 'aeronav',
    version: '0.1.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    backgroundColor: '#0d1117',
    ios: {
      bundleIdentifier: 'com.alfatango.aeronav',
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'AeroNav uses your location to show your aircraft position on the moving map.',
      },
    },
    android: {
      package: 'com.alfatango.aeronav',
      versionCode: 1,
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
      config: {
        // A placeholder key keeps the Google Maps SDK from crashing on start;
        // tiles then come from OpenStreetMap (see MapScreen.tsx).
        googleMaps: { apiKey: googleMapsApiKey || 'NO_KEY_USE_OSM_TILES' },
      },
    },
    plugins: ['expo-location'],
    extra: {
      useOsmTiles: !googleMapsApiKey,
    },
  },
};
