# Python для початківців

An interactive Python learning app for 7th graders, built with Expo + React Native. Runs on **web** and **iOS**. Features 10 Ukrainian-language chapters, an embedded Python playground (Skulpt), swipe navigation, shake-to-celebrate, and animated chapter cards.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18 or later | [nodejs.org](https://nodejs.org) or `brew install node` |
| npm | 9 or later | bundled with Node |
| Expo CLI | latest | `npm install -g expo-cli` (optional — `npx expo` works without it) |
| Xcode | 15+ | Mac App Store (iOS only) |
| iOS Simulator | included with Xcode | open via Xcode → Window → Devices |
| Expo Go app | latest | App Store on a physical iPhone (alternative to Simulator) |

---

## Setup

```bash
# 1. Clone or enter the project directory
cd python-book

# 2. Install dependencies
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required because some Expo packages declare peer dependency ranges that overlap with each other under npm's strict resolution.

---

## Running the app

### Web (browser)

```bash
npx expo start --web
```

Then open [http://localhost:8081](http://localhost:8081) in your browser.

The Python playground runs Skulpt directly in the browser — no extra setup needed.

---

### iOS Simulator

```bash
npx expo start --ios
```

Expo will build the app and launch it in the iOS Simulator automatically. Xcode must be installed and at least one simulator must be available.

---

### Physical iPhone (Expo Go)

```bash
npx expo start
```

1. Install **Expo Go** from the App Store on your iPhone.
2. Scan the QR code shown in the terminal with your iPhone camera.
3. The app will open in Expo Go.

> The Python playground uses a hidden WebView on native — ensure the device has internet access to load Skulpt from CDN.

---

### Interactive dev menu

After running `npx expo start`, press:

| Key | Action |
|-----|--------|
| `w` | Open in browser |
| `i` | Open in iOS Simulator |
| `r` | Reload the app |
| `j` | Open React DevTools |

---

## Project structure

```
python-book/
├── app/                        # expo-router screens
│   ├── _layout.tsx             # root layout (fonts, gesture handler, stack)
│   ├── index.tsx               # home screen (chapter grid)
│   └── chapter/
│       └── [id].tsx            # chapter screen (content + playground)
├── src/
│   ├── components/
│   │   ├── ChapterCard.tsx         # animated chapter card
│   │   ├── ContentRenderer.tsx     # renders chapter blocks (text, code, tables…)
│   │   ├── CodePlayground.web.tsx  # web: Skulpt loaded directly in page
│   │   └── CodePlayground.native.tsx # iOS/Android: Skulpt inside hidden WebView
│   ├── data/
│   │   └── chapters.ts         # 10 Ukrainian chapters with content blocks
│   ├── hooks/
│   │   ├── useShake.ts         # web stub (no-op)
│   │   └── useShake.native.ts  # iOS/Android: Accelerometer shake detection
│   ├── store/
│   │   └── progress.ts         # Zustand store (in-memory chapter progress)
│   └── theme.ts                # colors, fonts, spacing constants
├── babel.config.js
├── app.json
└── package.json
```

---

## Tech stack

| Layer | Library |
|-------|---------|
| Framework | Expo SDK 56 + React Native 0.85 |
| Routing | expo-router v4 (file-based) |
| Animations | react-native-reanimated v4 |
| Gestures | react-native-gesture-handler v2 |
| State | Zustand v5 (in-memory) |
| Fonts | @expo-google-fonts/nunito |
| Gradients | expo-linear-gradient |
| Haptics | expo-haptics |
| Shake | expo-sensors (native only) |
| Python | Skulpt 1.2.0 (runs in browser/WebView) |

---

## Troubleshooting

**`Cannot find module 'babel-preset-expo'`**
```bash
npm install babel-preset-expo --legacy-peer-deps
```

**`this._nativeModule.addListener is not a function` on web**
This is already fixed via platform-specific files (`useShake.ts` is a no-op on web, `useShake.native.ts` runs on iOS/Android only). If it reappears, clear the Metro cache:
```bash
npx expo start --clear
```

**Python output not showing in playground**
The web playground loads Skulpt from CDN. If output is missing, check the browser console for network errors (CDN blocked, offline, etc.).

**Port already in use**
```bash
npx expo start --port 8082
```

**Metro cache issues after pulling new changes**
```bash
npx expo start --clear
```
