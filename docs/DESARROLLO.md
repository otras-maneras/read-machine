# Desarrollo — Lector

## Requisitos

- Node.js 20+ (probado con 24)
- npm

## Comandos

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build — obligatorio antes de deploy
npm run lint      # oxlint
./deploy.sh       # producción
```

## Convenciones

### TypeScript

- Tipos en `engines/types.ts`.
- Lógica pura en `engines/` y `utils/`; React en `components/`.
- Preferir extender funciones existentes antes de duplicar.

### Estado (Zustand)

- Un store: `reader-store.ts`.
- `persistProgress()` al mover posición; cada 5 s si `isPlaying`.
- Acciones clave: `setChapter`, `startRsvpFromWord`, `setReaderLayout`.

### Capítulos — reglas estrictas

```typescript
// ✅ Offsets: igual que fullText en parsers
import { computeChapterOffsets } from '../utils/chapter-offsets';

// ✅ Scroll: slice de tokens globales
tokens.slice(chapterStart, chapterEnd);

// ❌ NO recontar palabras en TraditionalView con split manual + idx++
// ❌ NO tokenizar capítulos sueltos y sumar longitudes
// ❌ NO overlay de capítulo en <select> además del motor RSVP
```

**RSVPEngine + ReaderView:**

- `loadTokens()` al pausar o cambiar posición — no en cada tick.
- **No** `engine.pause()` en cleanup de effect cuando `chapterOverlay` está activo.
- `continueAfterChapterTitle()` retoma siempre (fuerza `playing = true`).
- `shownChapterOffsets`: evita repetir tarjeta; se limpia solo al saltar de posición.
- Tarjeta de capítulo 0 al inicio del libro: no se muestra (i > 0).

### ePub

```typescript
const section = book.spine.get(i); // ✅
const item = spine[i];             // ❌ crash
```

### Tokenización

- Texto >30k: `workers/tokenize-async.ts`.
- Scroll y RSVP comparten `tokens[]` del store.

### UI

| Capa | Fuente | Clases |
|------|--------|--------|
| Chrome | Inter | `.rm-window`, `.rm-seg`, `.rm-pill`, `.rm-switch`, … (`index.css`, estilo otrasmaneras) |
| Libro | Georgia | `.reading-text` |

Temas de **interfaz**: `light` | `dark` (paleta de otrasmaneras) y `paper` | `sepia` (de lectura) → `body.theme-{name}`.

Colores de **palabras** (opcional): `wordColorNames` → `utils/color-theme.ts` + `data/colornames.json`. No mezclar con variables `--color-reader-*` del tema.

### Añadir preferencia

Extender `types.ts` → `DEFAULT_PREFERENCES` → `db.loadPreferences()` (merge con `??`) → `SettingsDrawer` → componentes que consuman la pref.

### Colores por palabra

- Dataset embebido; no `fetch` a la API en runtime.
- Para más colores: regenerar desde `color-name-list` (MIT) filtrando por contraste contra ambos fondos.
- `getColorForWord(word)` debe ser determinista (misma palabra → mismo color).

### Mobile

- `h-[100dvh]`, `safe-top`, `safe-bottom`.
- ControlBar: 2 filas.
- Scroll: `overscroll-contain`; auto-scroll solo al **cambiar** capítulo.

### ETA

`utils/reading-time.ts` — palabras / WPM × 1.2; independiente del modo visual.

## Checklist deploy

- [ ] `npm run build` OK
- [ ] ePub import (alice.epub)
- [ ] RSVP: play, pausa, WPM, cruce de capítulo
- [ ] Selector capítulo → ▶ avanza
- [ ] Scroll: tap palabra → lectura rápida
- [ ] Ajustes: colorear palabras con colornames (interfaz sin cambiar)
- [ ] `./deploy.sh` + hard refresh en cliente

## Evaluado y descartado (por ahora)

**Pretext** (`@chenglou/pretext`) — medición de layout sin DOM. Útil solo para scroll virtualizado futuro; no integrar sin spike acordado. Ver [CONTINUACION.md](CONTINUACION.md).
