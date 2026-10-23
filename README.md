# Read Machine (Lector)

Webapp de lectura rápida: **RSVP**, **Bionic**, **Híbrido**, **scroll**, importación **ePub/PDF/TXT** y biblioteca offline.

**Producción:** https://reader.280642.xyz (público, sin clave)

## Características

- Modos RSVP (1 palabra + ORP), Bionic (bloques), Híbrido y scroll tradicional
- Scroll: palabras clicables → **«Lectura rápida desde aquí»** (salta a RSVP)
- Importación ePub, PDF, TXT, MD y texto pegado
- Biblioteca local (IndexedDB): progreso, marcadores, estadísticas, portadas
- **Biblioteca abierta:** clásicos en español de dominio público en `public/libros/` (`catalogo.json` + ePub + portadas); se abren con un clic y quedan en la biblioteca local
- Biblioteca UI estilo Apple Books («Leyendo ahora» + rejilla de portadas)
- PWA instalable, sin backend
- Interfaz con el estilo de [otrasmaneras.com](https://otrasmaneras.com): temas claro y oscuro, más papel y sepia para leer
- **Palabras con color**: cada palabra puede mostrarse en un color asociado, con nombre opcional

## Inicio rápido

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # salida en dist/
./deploy.sh      # build de producción
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo Vite |
| `npm run build` | TypeScript + build producción |
| `npm run preview` | Previsualizar `dist/` |
| `npm run lint` | Oxlint |
| `./deploy.sh` | Build de producción (`dist/`, sitio estático) |

## Documentación

| Audiencia | Empezar aquí |
|-----------|--------------|
| Agente / nueva sesión | [docs/CONTINUACION.md](docs/CONTINUACION.md) |
| Agentes IA | [AGENTS.md](AGENTS.md) |
| Detalle técnico | [docs/](docs/) |

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Dexie · epubjs · pdfjs-dist · vite-plugin-pwa

## Créditos

- Textos de la biblioteca abierta: obras de dominio público, de [Project Gutenberg](https://www.gutenberg.org/).
- Nombres de color: [color-name-list](https://github.com/meodai/color-name-list) de David Aerne (MIT).
- Motor RSVP inspirado en [dashreader](https://github.com/inattendu/dashreader) (MIT).
- Lectura de ePub y PDF: [epub.js](https://github.com/futurepress/epub.js) y [PDF.js](https://github.com/mozilla/pdf.js).

## Licencia

[MIT](LICENSE) © 2026 Otras Maneras. Los libros de `public/libros/` son de dominio público.

