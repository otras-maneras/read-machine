# Lector — Guía para Agentes de IA

Punto de entrada para cualquier agente que opere, modifique o despliegue **Lector** (`lector-app`): webapp de lectura rápida con RSVP, Bionic, ePub/PDF y almacenamiento local (sin backend).

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
| [docs/OPERACIONES.md](docs/OPERACIONES.md) | Deploy, Caddy, credenciales, troubleshooting |
| [docs/SEGURIDAD.md](docs/SEGURIDAD.md) | Basic auth, datos locales, secretos |

## Datos clave

| Atributo | Valor |
|----------|-------|
| Directorio | `/home/apps/lector/lector-app` |
| URL producción | https://read.otrasmaneras.com |
| Auth | Basic Auth — usuario `lector`; contraseña en `.auth-credentials` (servidor) |
| Stack | Vite 8 + React 19 + TS + Tailwind v4 + Zustand + Dexie + epubjs + pdfjs-dist |
| Backend | **Ninguno** — IndexedDB en el navegador |
| Deploy | `./deploy.sh` → build + `systemctl restart caddy` |
| Git | **No inicializado** aún en `lector-app` |
| PWA | Cache agresivo → hard refresh tras deploy |

## Estructura del código

```
src/
├── engines/          # RSVP, Bionic, ORP, tokenizer, micropausas
├── parsers/          # ePub, PDF, TXT/MD
├── workers/          # tokenize-async (>30k chars)
├── storage/          # Dexie v3
├── stores/           # reader-store.ts (Zustand)
├── services/         # session-stats
├── utils/
│   ├── chapter-offsets.ts   # ⚠️ crítico para capítulos
│   ├── color-theme.ts       # Colores por palabra (colornames local)
│   └── reading-time.ts      # ETA
├── data/
│   └── colornames.json      # ~130 colores con nombre (CC0, subset local)
├── components/
│   ├── library/      # LibraryView (Apple Books)
│   ├── import/
│   ├── reader/       # ReaderView, TraditionalView, ControlBar, …
│   └── settings/
└── hooks/
```

## Reglas para modificar el código

1. **Sin backend** — persistencia = Dexie.
2. **Capítulos** — un solo sistema de índices: `tokens[]` global + `utils/chapter-offsets.ts`. No recontar palabras en scroll.
3. **RSVP overlay** — no llamar `engine.pause()` en cleanup de effects cuando hay `chapterOverlay`.
4. **Tipografía dual** — UI = DM Sans; libro = Georgia (`.reading-text`).
5. **RSVP/Híbrido = 1 palabra**; Bionic agrupa con `bionicWordsPerChunk`.
6. **ETA** — palabras reales / WPM; no depende del modo visual.
7. **ePub** — `book.spine.get(i)`; nunca indexar spine como array.
8. **No commitear** `.auth-credentials`, `dist/`, secretos.
9. **Pretext** — no integrar salvo spike acordado de scroll virtualizado.
10. **Colornames** — colorear **palabras**, no la interfaz; dataset local en `src/data/colornames.json` (sin API en runtime por CORS/offline).
11. **Build** — `npm run build` antes de deploy.

## Referencias externas (solo lectura)

| Repo | Uso |
|------|-----|
| `/home/encargado-app` | Estética UI |
| `/home/apps/lector/dashreader` | RSVP original |
| `/home/apps/lector/shirah-reader` | ePub; `assets/alice.epub` para pruebas |
