# Lector

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
- Temas de interfaz: oscuro, papel, sepia, claro
- **Palabras con color** (colornames.org): cada palabra puede mostrarse en un color asociado, con nombre opcional

## Inicio rápido

```bash
cd /home/apps/lector/lector-app
npm install
npm run dev      # http://localhost:5173
npm run build    # salida en dist/
./deploy.sh      # producción
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo Vite |
| `npm run build` | TypeScript + build producción |
| `npm run preview` | Previsualizar `dist/` |
| `npm run lint` | Oxlint |
| `./deploy.sh` | Deploy a read.otrasmaneras.com |

## Documentación

| Audiencia | Empezar aquí |
|-----------|--------------|
| Agente / nueva sesión | [docs/CONTINUACION.md](docs/CONTINUACION.md) |
| Agentes IA | [AGENTS.md](AGENTS.md) |
| Detalle técnico | [docs/](docs/) |

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · Zustand · Dexie · epubjs · pdfjs-dist · vite-plugin-pwa
