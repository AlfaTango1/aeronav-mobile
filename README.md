# AeroNav Mobile — Flight Navigator (Expo / React Native)

A mobile flight-navigation app (EFB-style) built with **React Native + Expo**.
**Training / simulation project — NOT certified for real-world navigation.**

## Features

- **Moving map** with your **real GPS position** (expo-location) — ownship symbol rotated to heading
- **Gear position panel** — UP / TRANSIT / DOWN lamps (simulated; real gear data would come from
  aircraft systems via a Stratux/FlightBox GDL-90 feed)
- **Route planning** — tap the map to add waypoints; per-leg NM, bearing, WCA, groundspeed, ETE;
  totals for time and fuel
- **Flight zones** — danger / restricted / custom circles with vertical limits, visibility toggles
- **Flight simulation mode** — aircraft flies your route at the set groundspeed (great for testing
  indoors without GPS)
- **Aviation math library** — shared pure functions: wind correction, groundspeed, ETE, fuel,
  density altitude, true airspeed (`src/lib/flightCalc.ts`)

## Tech stack

| Layer     | Choice                              |
| --------- | ----------------------------------- |
| Framework | Expo SDK 51 + React Native 0.74     |
| Maps      | react-native-maps                   |
| Location  | expo-location                       |
| State     | Zustand                             |
| Language  | TypeScript                          |

## Download the APK

Every push to `main` is built by GitHub Actions (`.github/workflows/android-apk.yml`).
Get the APK from the repository's **Releases → latest** page (or from the workflow run's
**Artifacts**). Push a tag like `v0.1.0` to publish a versioned release.

Maps: without a Google Maps key the Android app shows **OpenStreetMap** tiles. To use Google maps,
add a repository secret `GOOGLE_MAPS_API_KEY` (Settings → Secrets and variables → Actions).

## Quick start

Requirements: [Node.js](https://nodejs.org) LTS, then:

```bash
npm install
npx expo start
```

- **On your phone:** install **Expo Go** (App Store / Play Store) and scan the QR code in the terminal.
- **Android emulator:** press `a`. **iOS simulator (macOS):** press `i`.

The first time you enable **GPS**, the app asks for location permission.

## Creating the GitHub repository

```bash
git init
git add .
git commit -m "feat: initial AeroNav Mobile scaffold (GPS map, gear, zones, route planning)"
# on GitHub: create a new EMPTY repository named aeronav-mobile (no README), then:
git remote add origin https://github.com/<your-username>/aeronav-mobile.git
git branch -M main
git push -u origin main
```

## How to use

1. Tap **"Plan"** in the header (map taps then add waypoints), tap the map to build a route.
2. Set TAS / wind / fuel flow in the **Route** panel — legs and totals update live.
3. Add **zones** in the Zones panel ("Use aircraft pos" fills the center for you).
4. Tap **"Sim"** to fly the route virtually, or **"GPS"** to use your real position.
5. Gear lamps are in the **Aircraft** panel.

## Project structure

```
aeronav-mobile/
├── README.md
├── LICENSE                   <- MIT
├── .gitignore
├── app.config.js             <- Expo config (package id, permissions, maps key)
├── index.js                  <- app entry (registers src/App)
├── .github/workflows/        <- CI: builds the Android APK
├── package.json
├── babel.config.js
├── tsconfig.json
└── src/
    ├── App.tsx               <- layout, GPS watcher, flight simulator
    ├── types.ts
    ├── lib/flightCalc.ts     <- great-circle & aviation math (pure TS)
    ├── store/useFlightStore.ts
    └── components/
        ├── MapScreen.tsx       <- react-native-maps: ownship, route, zones
        ├── InstrumentsPanel.tsx<- GS/ALT/HDG + gear lamps
        ├── RoutePanel.tsx      <- waypoints, legs, ETE/fuel totals
        └── ZonesPanel.tsx      <- create/list flight zones
```

## Roadmap

- Airspace data (OpenAIP) layers & "inside zone" alerts
- METAR/TAF weather + NOTAMs
- GPX/GeoJSON import-export of routes & zones
- Offline map tiles
- GDL-90 / Stratux feed: AHRS attitude, traffic (ADS-B), and real gear/flap status
- iOS build (needs Apple developer account / EAS)
- (Companion) the web version lives in the separate `aeronav` repo — the math library is identical

## Known MVP simplifications

- Zones are circles rendered as 36-point polygons; single constant wind layer; gear indication
  is simulated; simulator interpolates legs linearly in lat/lon (fine at short distances).

## License

MIT — see [LICENSE](LICENSE).
