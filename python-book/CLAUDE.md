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

```
app/
  _layout.tsx
  index.tsx                          ← вибір класу (5–9)
  grade/
    [grade].tsx                      ← вибір предмету
    [grade]/
      [subject].tsx                  ← список уроків
      [subject]/
        [lesson].tsx                 ← урок (контент + інтерактив)
src/
  data/
    types.ts                         ← Block, Lesson, SubjectId, GradeId
    grades.ts                        ← GRADES (id, label, emoji, color, subjects[])
    subjects.ts                      ← SUBJECTS (id, title, emoji, color)
    curriculum/
      informatyka.ts                 ← 5–9 кл, 7 уроків кожен
      matematyka.ts                  ← 5–6 кл, 7 уроків кожен
      algebra.ts                     ← 7–9 кл, 6 уроків кожен
      geometriya.ts                  ← 7–9 кл, 6 уроків кожен
      index.ts                       ← ALL_CONTENT[], getContent(gradeId, subjectId)
  components/
    ContentRenderer.tsx              ← рендер Block[]
    QuizBlock.tsx                    ← інтерактивний тест (A/B/C/D)
    FillInBlock.tsx                  ← задача «введи відповідь»
    CodePlayground.tsx               ← web: Skulpt напряму в браузері
    CodePlayground.native.tsx        ← native: прихований WebView + injectJavaScript
    PlaygroundModal.tsx              ← модальне вікно 60/40 (редактор/вивід)
  hooks/
    useShake.ts                      ← web stub
    useShake.native.ts               ← Accelerometer iOS/Android
  store/
    progress.ts                      ← Zustand, ключ: "${grade}:${subject}:${lesson}"
  theme.ts
```

## Platform-specific files

Metro: `.native.tsx` > `.tsx` (native), `.tsx` (web fallback — немає `.web.tsx`).

- `CodePlayground.tsx` — web: Skulpt завантажується через `<script>`, Python виконується в головному потоці
- `CodePlayground.native.tsx` — native: прихований WebView, код надсилається через injectJavaScript
- `useShake.ts` — порожня заглушка (web)
- `useShake.native.ts` — Accelerometer + expo-haptics (iOS/Android)

## Block types

```ts
| { type: 'h3' | 'p'; text: string }
| { type: 'code'; text: string }
| { type: 'tip' | 'note' | 'warning'; text: string }
| { type: 'list'; items: string[] }
| { type: 'table'; headers: string[]; rows: string[][] }
| { type: 'quiz'; question: string; options: string[]; correct: number; explanation: string }
| { type: 'fill'; problem: string; hint: string; answer: string }
| { type: 'image'; uri: string; caption: string }
```

For `image` blocks use Wikimedia Commons PNG-rendered URLs (works in React Native `Image`):
- SVG files: `https://upload.wikimedia.org/wikipedia/commons/thumb/a/b/file.svg/320px-file.svg.png`
- JPG files: `https://upload.wikimedia.org/wikipedia/commons/thumb/a/b/file.jpg/320px-file.jpg`

## Theme system

Three color schemes (`SchemeId = 'indigo' | 'pine' | 'amber'`) defined in `src/data/themes.ts`.
State lives in `src/store/theme.ts` (Zustand). Access active colors with `const C = useColors()` from `src/hooks/useColors.ts`.

**Dynamic theming rule**: `StyleSheet.create()` runs at module init — only put layout/sizing there. Apply colors as inline overrides: `[styles.wrap, { backgroundColor: C.bg }]`.

## Navigation shell

`src/components/AppShell.tsx` wraps every screen (via `app/_layout.tsx`):
- Mobile (< 768px): floating ☰ button (top-right) + animated slide-in drawer
- Tablet+ (≥ 768px): persistent `WideHeader` (logo + grade links + theme dots)

## Key constraints

- Весь текст — **українською** (НУШ 2025–2026)
- Предмети: informatyka (5–9), matematyka (5–6), algebra (7–9), geometriya (7–9)
- Progress зберігається в пам'яті (Zustand, без AsyncStorage)
- Python: Skulpt 1.2.0 — не Pyodide
- Шрифти: Nunito (400/700/800) з @expo-google-fonts/nunito

## Додавання нового уроку

Відкрий відповідний файл `src/data/curriculum/*.ts` та додай до масиву `lessons`:

```ts
{
  id: 8,
  title: 'Назва уроку',
  intro: 'Короткий опис.',
  blocks: [
    { type: 'h3', text: 'Підзаголовок' },
    { type: 'p', text: 'Текст з **жирним** і `кодом`.' },
    { type: 'quiz', question: '...?', options: ['A','B','C','D'], correct: 0, explanation: '...' },
    { type: 'fill', problem: 'x + 3 = 7, x = ?', hint: 'підказка', answer: '4' },
  ],
  initialCode: 'print("hello")',  // тільки для informatyka
}
```

## Deploy to Firebase Hosting

```bash
./deploy-firebase.sh            # build + deploy
./deploy-firebase.sh --no-build # deploy existing dist/ only
```

No `firebase login` needed — uses service account JWT via REST API.

**Service account key location** (script checks in this order):
1. `~/.config/secrets/school28-d2877-sa.json` ← постійне місце
2. `~/Downloads/school28-d2877-firebase-adminsdk-fbsvc-*.json` ← fallback

Live URLs: https://school28-d2877.web.app · https://school28-d2877.firebaseapp.com

## Secrets rule

All service account keys and tokens belong in `~/.config/secrets/` with `chmod 600`.
Never put secrets inside the project directory — even in `.env` files that are gitignored.
The deploy script must read keys from `~/.config/secrets/`, not from the repo.

## Docs reference

Expo SDK 56 docs: https://docs.expo.dev/versions/v56.0.0/
