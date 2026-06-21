# Python для початківців — Claude Code context

## What this project is

An interactive Python learning app for Ukrainian 7th graders. Built with Expo SDK 56 + React Native 0.79 + expo-router v4. Runs on web (browser) and iOS.

## How to run

```bash
npm install --legacy-peer-deps
npx expo start --web      # browser
npx expo start --ios      # iOS Simulator (requires Xcode)
npx expo start            # scan QR with Expo Go on iPhone
```

Always pass `--legacy-peer-deps` to npm. Never omit it.

## Architecture

- `app/` — expo-router screens (`_layout.tsx`, `index.tsx`, `chapter/[id].tsx`)
- `src/components/` — UI components
- `src/data/chapters.ts` — all 10 Ukrainian chapters as typed block arrays
- `src/store/progress.ts` — Zustand in-memory progress (no persistence)
- `src/hooks/useShake.ts` + `useShake.native.ts` — platform-specific shake hook
- `src/theme.ts` — colors, fonts, spacing

## Platform-specific files

Metro resolves `.web.tsx` over `.tsx` on web, and `.native.tsx` over `.tsx` on native.

- `CodePlayground.web.tsx` — loads Skulpt via CDN `<script>` tag, runs Python in the main thread
- `CodePlayground.native.tsx` — hidden WebView + injectJavaScript, postMessage back
- `useShake.ts` — empty stub (web)
- `useShake.native.ts` — Accelerometer + expo-haptics (iOS/Android)

Never use `Platform.OS === 'web'` guards inside files that import `expo-sensors` — Metro bundles statically and will crash. Always use the `.native.ts` / `.ts` file pair instead.

## Key constraints

- All user-facing text is in **Ukrainian**
- Chapter content uses a typed `Block` union (h3, p, code, tip, note, warning, table, list) — never raw HTML strings
- Progress is in-memory only (Zustand, no AsyncStorage)
- Python execution uses **Skulpt 1.2.0** (not Pyodide) — lighter, works inside WebView
- Fonts: Nunito (400, 700, 800) from @expo-google-fonts/nunito
- Navigation: expo-router Stack, swipe gestures via react-native-gesture-handler
- Animations: react-native-reanimated v4 (spring, FadeIn, stagger)

## Adding a new chapter

Edit `src/data/chapters.ts`. Each chapter follows this shape:

```ts
{
  id: 11,
  emoji: '🔢',
  title: 'Назва розділу',
  intro: 'Короткий опис.',
  blocks: [
    { type: 'h3', text: 'Заголовок' },
    { type: 'p', text: 'Текст з **жирним** і `кодом` підтримується.' },
    { type: 'code', text: 'print("hello")' },
    { type: 'tip', text: 'Порада для учня.' },
  ],
  initialCode: 'print("Привіт!")',
}
```

Then update `COLORS.chapters` in `src/theme.ts` to add a color for the new chapter.

## Docs reference

Expo SDK 56 docs: https://docs.expo.dev/versions/v56.0.0/
