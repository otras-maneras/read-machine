# Arquitectura — Lector

## Visión general

SPA estática sin backend. El navegador:

1. Importa y parsea documentos (ePub/PDF/texto).
2. Tokeniza el texto en palabras (`engines/tokenizer.ts`).
3. Calcula offsets de capítulo (`utils/chapter-offsets.ts`).
4. Persiste libros y preferencias en **IndexedDB** (`storage/db.ts`, `lector-db`).
5. Reproduce lectura RSVP (`engines/rsvp-engine.ts`) o scroll (`TraditionalView`).

```
ImportView → parsers/* → reader-store → Dexie
                ↓
         tokenize / tokenizeAsync (worker)
                ↓
    computeChapterOffsets(chapters)
                ↓
    ReaderView → RSVPEngine | TraditionalView
                      ↓              ↓
               ChapterTitleCard   tokens[] slice por capítulo
```

## Pantallas (Zustand `screen`)

| Pantalla | Componente | Descripción |
|----------|------------|-------------|
| `library` | `LibraryView` | «Leyendo ahora» + rejilla de portadas |
| `import` | `ImportView` | Pegar texto o subir archivo |
| `reader` | `ReaderView` | Lector activo |

Estado principal: `stores/reader-store.ts`.

## Capítulos e índices de palabra

**Una sola fuente de verdad:** el array `tokens[]` tokenizado desde `fullText`.

```typescript
// parsers: fullText = chapters.map(c => c.text).join('\n\n')
// utils/chapter-offsets.ts:
computeChapterOffsets(chapters)  // tokeniza prefijos unidos igual que fullText
findChapterForWordIndex(offsets, wordIndex)
```

- RSVP, scroll, ProgressBar, marcadores y persistencia usan el **mismo** `wordIndex`.
- `TraditionalView` renderiza `tokens.slice(chapterStart, chapterEnd)` — no recontar palabras.
- `RSVPEngine` muestra `ChapterTitleCard` al llegar a `chapterOffsets[i]` (i > 0).

Ver trampas en [CONTINUACION.md](CONTINUACION.md#sistema-de-capítulos-leer-antes-de-tocar).

## Motores de lectura

| Módulo | Rol |
|--------|-----|
| `rsvp-engine.ts` | Timer, WPM, Bionic chunks, tarjetas de capítulo, `shownChapterOffsets` |
| `bionic-engine.ts` | Resaltado Bionic |
| `orp-calculator.ts` | Punto de fijación (RSVP/Híbrido) |
| `micropause-service.ts` | Pausas por puntuación, números, párrafos |
| `tokenizer.ts` | Texto → `Token[]` |

## Layouts y modos

| Eje | Valores | Efecto |
|-----|---------|--------|
| **Layout** | `rsvp` \| `scroll` | Centrado vs continuo |
| **Modo** | `rsvp` \| `bionic` \| `hybrid` | Solo con layout RSVP |

`startRsvpFromWord()` en store: scroll → RSVP + play desde `wordIndex` actual.

Ver [MODOS-LECTURA.md](MODOS-LECTURA.md).

## Colores por palabra (colornames)

Integración opcional con nombres de color de [colornames.org](https://colornames.org/). **Solo afecta al texto de las palabras**, no al tema de la interfaz.

```
word (token.text)
    ↓
utils/color-theme.ts → getColorForWord()
    ↓
match en COLOR_BY_WORD  →  color del nombre
    o hash estable       →  colornames.json[index]
    ↓
WordDisplay / TraditionalView  (style.color)
```

| Archivo | Rol |
|---------|-----|
| `data/colornames.json` | Subset local `{ hexCode, name }` (~130); CC0 |
| `utils/color-theme.ts` | `getColorForWord`, `lookupColorName`, `colorHex` |
| `WordDisplay.tsx` | RSVP/Bionic/Híbrido; etiqueta opcional bajo palabra |
| `TraditionalView.tsx` | Color por `<span>`; `title` con nombre del color |
| `SettingsDrawer.tsx` | Toggles `wordColorNames`, `showWordColorNames` |

**No** se llama a `colornames.org` desde el navegador (CORS + offline PWA). Para ampliar la paleta: regenerar JSON en build desde el CSV oficial.

## Parsers

| Formato | Archivo | Notas |
|---------|---------|-------|
| ePub | `parsers/epub-parser.ts` | `spine.get(i)`; títulos duplicados → sufijo `· N` |
| PDF | `parsers/pdf-parser.ts` | pdfjs-dist |
| TXT/MD | `parsers/index.ts` | Texto plano |
| Paste | `parsers/index.ts` | `parsePastedText()` |

Parsers ePub/PDF: dynamic import (code-splitting).

## IndexedDB (Dexie v3)

| Tabla | Contenido |
|-------|-----------|
| `books` | Texto, capítulos, progreso, portada, `sourceFile` opcional |
| `preferences` | WPM, tema, Bionic, layout, `wordColorNames`, `showWordColorNames`, etc. |
| `sessions` | Última sesión (`id: 'current'`) |
| `bookmarks` | Por libro |
| `stats` | Estadísticas globales |

Datos **por navegador** — sin sync en nube.

## PWA

- `vite-plugin-pwa` + Workbox precache.
- Tras deploy: hard refresh puede ser necesario.
- `manifest.webmanifest` puede dar 401 con Basic Auth (inofensivo).

## Build y chunks

`vite.config.ts`: `epub`, `pdf`, `vendor` (react, zustand, dexie).  
`theme_color`: `#0a0a09`.

## Despliegue

```
/home/apps/lector/lector-app/dist  →  Caddy file_server
read.otrasmaneras.com         →  basic_auth + try_files /index.html
```

[OPERACIONES.md](OPERACIONES.md)
