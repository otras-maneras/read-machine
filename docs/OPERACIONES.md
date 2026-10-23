# Operaciones — Read Machine

## Producción

| Item | Valor |
|------|-------|
| URL | https://reader.280642.xyz |
| Acceso | Público, sin login |
| Servidor | Cualquier hosting estático que sirva `dist/` (SPA: rutas desconocidas → `index.html`) |

## Build y publicación

```bash
npm ci
npm run build      # genera dist/
./deploy.sh        # equivalente: build listo para copiar/servir
```

Ejemplo de servidor (Caddy):

```
reader.ejemplo.com {
	encode gzip zstd
	root * /ruta/a/lector-app/dist
	try_files {path} /index.html
	file_server
}
```

## Desarrollo local

```bash
npm run dev        # :5173
npm run build && npm run preview
```

## PWA

Tras publicar: **Ctrl+Shift+R** o recargar dos veces si la UI no actualiza (service worker).

## Troubleshooting

| Problema | Causa | Acción |
|----------|-------|--------|
| Capítulos repetidos / play no avanza | Bugs conocidos (jul 2026) | Ver [CONTINUACION.md](CONTINUACION.md); no reintroducir offsets manuales ni pause en cleanup |
| ePub crash | Spine como array | `spine.get(i)` |
| Scroll trabado | Auto-scroll agresivo | Solo scroll al cambiar capítulo |
| UI vieja post-deploy | Service worker | Hard refresh |
| Libro del catálogo no abre | Falta el ePub o la portada en `public/libros/` | Revisar `catalogo.json` y los archivos |

## Datos y backups

- Libros importados en **IndexedDB del navegador** — no hay base de datos en el servidor.
- Biblioteca abierta: `public/libros/` (ePub + `portadas/` + `catalogo.json`), versionada en git.

## Archivos de prueba

Cualquier ePub de `public/libros/` (dominio público).
