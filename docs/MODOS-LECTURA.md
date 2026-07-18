# Modos de lectura

Dos ejes independientes: **layout** (vista) y **modo** (visual, solo RSVP).

## Layout

### RSVP (`readerLayout: 'rsvp'`)

- Palabra(s) centradas; motor con timer WPM.
- ControlBar fila 2: transport + WPM.
- Atajos: Espacio play/pausa, ←→ ±10, ↑↓ WPM, Esc biblioteca.

### Scroll (`readerLayout: 'scroll'`)

- Texto continuo del capítulo actual (`TraditionalView`).
- Sin timer; scroll manual.
- Palabras clicables → botón **«Lectura rápida desde aquí»**:
  - Llama `startRsvpFromWord()` en store.
  - Cambia a RSVP + reproduce desde esa palabra.
  - Usa el `readingMode` configurado (Híbrido/RSVP/Bionic).

## Modo visual (solo RSVP)

| Modo | Palabras | Descripción |
|------|----------|-------------|
| RSVP | 1 | ORP |
| Híbrido | 1 | Bionic + ORP |
| Bionic | 1–12 | Bloques (`bionicWordsPerChunk`) |

## Capítulos

### RSVP — tarjeta intersticial

Al llegar al **inicio** de un capítulo (índice = `chapterOffsets[i]`, i ≥ 1):

1. Motor pausa timer (`waitingChapterTitle`).
2. `ChapterTitleCard` overlay (~3.2 s auto-dismiss).
3. Espacio / tap / ▶ → continúa.

**No** hay overlay al elegir capítulo en el `<select>` — solo al cruzar durante lectura o al reproducir desde el offset del capítulo.

### Scroll

- Título de capítulo como `<h2>` si no está duplicado en el texto.
- Cambio de capítulo vía selector: scroll al inicio del capítulo.

## WPM y ETA

- ETA = palabras restantes / WPM (factor micropausas ~1.2).
- Mismas palabras en RSVP y Bionic → mismo tiempo total.
- `ProgressBar`: % posición, ETA libro y capítulo.

## Bionic en scroll

Preferencia `bionicInScroll` + modo Bionic/Híbrido → resaltado en párrafos.

## Palabras con color (colornames)

Preferencias en `UserPreferences`:

| Campo | Default | Efecto |
|-------|---------|--------|
| `wordColorNames` | `false` | Activa color por palabra |
| `showWordColorNames` | `true` | Muestra nombre del color (RSVP: bajo palabra; scroll: `title`) |

### Asignación de color

1. Normalizar palabra (minúsculas, sin acentos).
2. Si coincide con un token de un nombre en `colornames.json` (p. ej. `red`, `mint`) → ese color.
3. Si no → `hash(palabra) % colornames.length` (misma palabra = mismo color siempre).

### Comportamiento por layout

| Layout | Dónde se pinta |
|--------|----------------|
| RSVP / Híbrido | Palabra entera; ORP usa el mismo color si `wordColorNames` está activo |
| Bionic | Cada palabra del bloque con su color |
| Scroll | Cada `<span>` de palabra; hover muestra nombre |

La interfaz (fondo, paneles, ControlBar) sigue usando el tema elegido (`dark` \| `paper` \| `sepia` \| `light`).
