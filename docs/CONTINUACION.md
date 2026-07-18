# Continuación de sesión — Lector

**Última actualización:** 3 julio 2026  
**Propósito:** todo lo que un agente o desarrollador necesita para retomar el proyecto sin leer el historial del chat.

---

## Estado actual del producto

Lector es una **SPA de lectura rápida** desplegada en producción. Funcional y usable; los bugs críticos de capítulos del julio 2026 están corregidos.

| Área | Estado |
|------|--------|
| RSVP / Bionic / Híbrido | ✅ Estable |
| Modo scroll + palabras clicables | ✅ Estable |
| «Lectura rápida desde aquí» (scroll → RSVP) | ✅ Implementado |
| Biblioteca estilo Apple Books | ✅ Implementado |
| Import ePub / PDF / TXT / MD / paste | ✅ Funcional |
| IndexedDB + progreso + marcadores | ✅ Funcional |
| PWA + Basic Auth | ✅ En producción |
| Palabras con color (colornames) | ✅ Implementado (dataset local) |
| Git en `lector-app` | ❌ **No inicializado** (solo `.gitignore`) |
| Pretext (layout de texto) | ❌ **Evaluado, no integrar por ahora** |

---

## Acceso rápido

```bash
cd /home/apps/lector/lector-app
npm run dev          # http://localhost:5173 (sin auth)
npm run build        # verificar antes de deploy
./deploy.sh          # producción
```

| Item | Valor |
|------|-------|
| URL prod | https://read.otrasmaneras.com |
| Auth | HTTP Basic — usuario `lector`, contraseña en `/home/apps/lector/lector-app/.auth-credentials` |
| Build output | `/home/apps/lector/lector-app/dist` |
| Caddy | `/etc/caddy/Caddyfile` → bloque `read.otrasmaneras.com` |

**No commitear** `.auth-credentials`. Plantilla: `.auth-credentials.example`.

---

## Qué se implementó (historial resumido)

### Fase 1 — MVP
- App completa: biblioteca, import, RSVP, Bionic, Híbrido, scroll, IndexedDB, PWA, marcadores, estadísticas.
- Persistencia local; archivo fuente opcional en import.
- Basic Auth en Caddy.

### Fase 2 — UI y UX
- Estética inspirada en `/home/encargado-app` (DM Sans + paneles `.ot-*`).
- Temas: `dark`, `light`, `sepia`, `paper`.
- Tipografía de lectura: **Georgia** (`.reading-text`).
- ControlBar compacta (2 filas); botón Biblioteca fijo en cabecera.
- ProgressBar con ETA por palabras reales (`utils/reading-time.ts`).
- Tarjetas de título de capítulo en RSVP (`ChapterTitleCard`).

### Fase 3 — Scroll y biblioteca
- Scroll: sin auto-scroll agresivo; palabras clicables; botón **«Lectura rápida desde aquí»**.
- Biblioteca: sección «Leyendo ahora» + rejilla de portadas (estilo Apple Books).
- Store: `startRsvpFromWord()` para saltar de scroll a RSVP reproduciendo.

### Fase 4 — Fixes de capítulos (crítico)
Varios bugs hacían que capítulos se repitieran o el play no avanzara:

1. **Offsets incorrectos** — `computeChapterOffsets` sumaba tokens por capítulo suelto, no como `fullText` unido con `\n\n`. Solución: `utils/chapter-offsets.ts`.
2. **Scroll contaba palabras distinto** — `TraditionalView` recontaba a mano (+1 por párrafo). Solución: usar `tokens[]` globales del store.
3. **Motor pausado al mostrar tarjeta** — un `useEffect` en `ReaderView` hacía `engine.pause()` en cleanup al aparecer overlay. Solución: quitar cleanup agresivo; `continueAfterChapterTitle()` fuerza reanudar.
4. **Doble tarjeta de capítulo** — overlay manual en selector + motor. Solución: solo el motor muestra tarjeta; no overlay al cambiar capítulo en `<select>`.
5. **Capítulos ePub con mismo título** — sufijo `· N` en `epub-parser.ts`.

### Fase 5 — Palabras con color (colornames)
- Integración con [colornames.org](https://colornames.org/): cada **palabra** del libro puede mostrarse en un color asociado.
- **No** cambia el tema de la interfaz (fondo, menús, etc.) — solo el color del texto de las palabras.
- Dataset local `src/data/colornames.json` (~130 entradas `hexCode` + `name`); sin llamadas a la API en runtime (CORS + PWA offline).
- Lógica en `utils/color-theme.ts`:
  - Si la palabra coincide con un token de un nombre de color → ese color.
  - Si no → hash estable de la palabra → índice en el JSON.
- Preferencias: `wordColorNames`, `showWordColorNames` en `UserPreferences`.
- UI: Ajustes → «Colorear palabras con colornames»; RSVP muestra etiqueta bajo la palabra; scroll usa `title` con el nombre.
- Se descartó el tema `custom` que pintaba fondo/letras de la interfaz.

---

## Archivos clave (mapa mental)

```
src/
├── stores/reader-store.ts      # Estado global Zustand; init, openBook, setChapter, startRsvpFromWord
├── engines/
│   ├── rsvp-engine.ts          # Timer RSVP; shownChapterOffsets; onChapterTitle
│   ├── tokenizer.ts            # Texto → Token[] (fuente de verdad de índices)
│   └── types.ts                # UserPreferences, BookRecord, etc.
├── utils/
│   ├── chapter-offsets.ts      # computeChapterOffsets, findChapterForWordIndex
│   ├── color-theme.ts          # getColorForWord, lookupColorName
│   └── reading-time.ts         # ETA
├── data/
│   └── colornames.json         # Subset local CC0 (no API en cliente)
├── components/
│   ├── reader/
│   │   ├── ReaderView.tsx      # Orquesta engine + overlay + layouts
│   │   ├── WordDisplay.tsx     # RSVP/Bionic/Híbrido; colores por palabra
│   │   ├── TraditionalView.tsx # Scroll; tokens globales; botón lectura rápida
│   │   ├── ControlBar.tsx      # RSVP/scroll + modos + transport
│   │   └── ProgressBar.tsx
│   └── library/LibraryView.tsx # Apple Books layout
├── parsers/epub-parser.ts      # spine.get(i); títulos deduplicados
├── storage/db.ts               # Dexie v3
└── index.css                   # Temas + .ot-* + .reading-text

AGENTS.md                         # Entrada para agentes
docs/CONTINUACION.md              # Este archivo
deploy.sh                         # build + restart caddy
.auth-credentials                 # Secretos (servidor)
```

---

## Sistema de capítulos (leer antes de tocar)

### Fuente de verdad
- **Tokens globales:** `tokenize(fullText)` donde `fullText = chapters.map(c => c.text).join('\n\n')`.
- **Offsets:** `computeChapterOffsets(chapters)` → índice del primer token de cada capítulo en ese array global.
- **Scroll y RSVP** deben usar el **mismo** `wordIndex` sobre `tokens[]`.

### Flujo RSVP al cruzar capítulo
1. Motor detecta `currentIndex === chapterOffsets[i]` (i > 0).
2. `onChapterTitle` → overlay + sync `currentChapterIndex` y `wordIndex`.
3. Usuario: Espacio / tap / auto-dismiss ~3.2 s.
4. `continueAfterChapterTitle()` → retoma lectura.
5. `shownChapterOffsets` evita repetir tarjeta al pausar/reanudar en el mismo inicio.

### Trampas conocidas (no reintroducir)
| Error | Consecuencia |
|-------|--------------|
| Recontar palabras en scroll a mano | Desincronización scroll ↔ RSVP |
| `engine.pause()` en cleanup de effect cuando hay overlay | Play no avanza tras tarjeta |
| Overlay manual + motor para mismo capítulo | Capítulo aparece dos veces |
| Tokenizar capítulos por separado para offsets | Capítulos desplazados desde el 2º |
| Indexar `book.spine` como array | Crash ePub (`linear` undefined) |

---

## Store — acciones importantes

| Acción | Cuándo |
|--------|--------|
| `init()` | Arranque app; carga prefs, resume hint |
| `openBook(id)` | Abrir desde biblioteca |
| `loadDocument(doc)` | Tras import |
| `setChapter(index)` | Selector de capítulo; pausa; va a offset |
| `startRsvpFromWord()` | Botón en scroll; layout=rsvp + play |
| `setReaderLayout()` | Cambio RSVP↔scroll; pausa |
| `persistProgress()` | Cada 5 s si playing; al salir |

---

## Decisiones explícitas (no revertir sin consultar)

1. **Sin backend** — IndexedDB only.
2. **ETA por palabras**, no por modo visual (RSVP y Bionic recorren las mismas palabras).
3. **RSVP/Híbrido = 1 palabra**; Bionic puede agrupar (`bionicWordsPerChunk`).
4. **Georgia** para texto del libro; DM Sans para UI.
5. **Pretext** (`@chenglou/pretext`) — útil solo para scroll virtualizado futuro; **no integrar ahora**.
6. **Colornames** — colorear palabras, no UI; dataset embebido, sin `fetch` a colornames.org en producción.
7. **No tocar** otros bloques de `/etc/caddy/Caddyfile`.

---

## Pendiente / mejoras futuras

- [ ] Ampliar `colornames.json` (CSV completo CC0 es ~46 MB; valorar top N por votos en build)
- [ ] Inicializar git en `lector-app` y primer commit
- [ ] Probar con ePubs reales del usuario; algunos TOC tienen muchas entradas repetidas
- [ ] Scroll virtualizado en capítulos muy largos (candidato: Pretext solo medición)
- [ ] Sincronización en nube / multi-dispositivo (requiere backend — fuera MVP)
- [ ] Tests automatizados para `chapter-offsets.ts` y `rsvp-engine`

---

## Checklist al retomar

1. Leer este doc + `AGENTS.md`.
2. `npm run build` — debe pasar.
3. Probar en prod o dev:
   - Import ePub (`/home/apps/lector/shirah-reader/assets/alice.epub`)
   - RSVP play → cruzar capítulo → tarjeta → continúa
   - Selector de capítulo → ▶ empieza
   - Scroll → tap palabra → «Lectura rápida desde aquí»
   - Ajustes → «Colorear palabras con colornames» → palabras cambian color, interfaz no
4. Tras cambios en UI: `./deploy.sh` + avisar hard refresh (PWA).

---

## Referencias en el servidor

| Ruta | Uso |
|------|-----|
| `/home/encargado-app` | Referencia UI (AGENTS.md, estilos) |
| `/home/apps/lector/dashreader` | RSVP original |
| `/home/apps/lector/shirah-reader` | ePub + alice.epub de prueba |
| `/home/apps/lector/bionic-for-zotero` | Bionic reading |
| `/home/apps/lector/smartReader` | Otra referencia |

---

## Documentación completa

| Doc | Contenido |
|-----|-----------|
| [AGENTS.md](../AGENTS.md) | Entrada agentes, reglas, mapa |
| [ARQUITECTURA.md](ARQUITECTURA.md) | Stack, flujo, IndexedDB |
| [DESARROLLO.md](DESARROLLO.md) | Patrones, convenciones, checklist |
| [MODOS-LECTURA.md](MODOS-LECTURA.md) | RSVP, scroll, atajos |
| [OPERACIONES.md](OPERACIONES.md) | Deploy, Caddy, troubleshooting |
| [SEGURIDAD.md](SEGURIDAD.md) | Auth, secretos, datos locales |
