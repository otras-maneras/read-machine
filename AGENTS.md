# Read Machine (Lector) — Guía para Agentes de IA

Punto de entrada para cualquier agente que opere, modifique o despliegue **Read Machine** (`lector-app`): webapp de lectura rápida con RSVP, Bionic, ePub/PDF y almacenamiento local (sin backend).

> **Retomando en una sesión nueva:** leé primero [docs/CONTINUACION.md](docs/CONTINUACION.md) (estado actual, bugs resueltos, trampas de capítulos).  
> **Antes de escribir código:** [docs/DESARROLLO.md](docs/DESARROLLO.md) y [docs/SEGURIDAD.md](docs/SEGURIDAD.md).

## Mapa de documentación

| Documento | Responsabilidad |
|-----------|-----------------|
| [docs/CONTINUACION.md](docs/CONTINUACION.md) | **Handoff** — estado, historial, archivos clave, pendientes |
| [README.md](README.md) | Resumen humano, inicio rápido, scripts |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Stack, flujo de datos, motores, capítulos, IndexedDB, PWA |
| [docs/DESARROLLO.md](docs/DESARROLLO.md) | Patrones, convenciones, trampas, checklist |
| [docs/MODOS-LECTURA.md](docs/MODOS-LECTURA.md) | RSVP, Bionic, Híbrido, Scroll |
| [docs/OPERACIONES.md](docs/OPERACIONES.md) | Build, publicación, troubleshooting |
| [docs/SEGURIDAD.md](docs/SEGURIDAD.md) | Acceso público, datos locales, secretos |

## Datos clave

| Atributo | Valor |
|----------|-------|
| URL producción | https://reader.280642.xyz (pública, sin login) |
| Repo | https://github.com/otras-maneras/read-machine |
| Stack | Vite 8 + React 19 + TS + Tailwind v4 + Zustand + Dexie + epubjs + pdfjs-dist |
| Backend | **Ninguno** — IndexedDB en el navegador |
| Deploy | `npm run build` → servir `dist/` como estático |
| PWA | Cache agresivo → hard refresh tras deploy |

## Estructura del código

```
src/
├── engines/          # RSVP, Bionic, ORP, tokenizer, micropausas
├── parsers/          # ePub, PDF, TXT/MD
├── workers/          # tokenize-async (>30k chars)
├── storage/          # Dexie v3
├── stores/           # reader-store.ts (Zustand)
├── services/         # session-stats, catalog (biblioteca abierta)
├── utils/
│   ├── chapter-offsets.ts   # ⚠️ crítico para capítulos
│   ├── color-theme.ts       # Colores por palabra (lista local)
│   └── reading-time.ts      # ETA
├── data/
│   └── colornames.json      # 180 colores legibles de color-name-list (MIT, David Aerne)
├── components/
│   ├── ui/           # SystemBar, Sheet, Icon (estilo otrasmaneras)
│   ├── library/      # LibraryView + biblioteca abierta
│   ├── import/
│   ├── reader/       # ReaderView, TraditionalView, ControlBar, …
│   └── settings/
└── hooks/
```

## Reglas para modificar el código

1. **Sin backend** — persistencia = Dexie.
2. **Capítulos** — un solo sistema de índices: `tokens[]` global + `utils/chapter-offsets.ts`. No recontar palabras en scroll.
3. **RSVP overlay** — no llamar `engine.pause()` en cleanup de effects cuando hay `chapterOverlay`.
4. **Tipografía dual** — UI = Inter; libro = Georgia (`.reading-text`). Estética de otrasmaneras.com: clases `rm-*` en `index.css`.
5. **RSVP/Híbrido = 1 palabra**; Bionic agrupa con `bionicWordsPerChunk`.
6. **ETA** — palabras reales / WPM; no depende del modo visual.
7. **ePub** — `book.spine.get(i)`; nunca indexar spine como array.
8. **No commitear** `dist/` ni secretos.
9. **Pretext** — no integrar salvo spike acordado de scroll virtualizado.
10. **Colores por palabra** — colorear **palabras**, no la interfaz; dataset local en `src/data/colornames.json` (sin API en runtime).
11. **Build** — `npm run build` antes de deploy.

## Referencias externas (solo lectura)

| Proyecto | Uso |
|----------|-----|
| [otrasmaneras.com](https://otrasmaneras.com) | Estética de la interfaz (paleta, ventanas, barra de sistema) |
| [dashreader](https://github.com/inattendu/dashreader) (MIT) | Inspiración del motor RSVP |
| [color-name-list](https://github.com/meodai/color-name-list) (MIT) | Nombres de colores |
| `public/libros/` | ePub de dominio público para pruebas |
