# Documentación — Lector

## Por dónde empezar

| Si eres… | Lee |
|----------|-----|
| Agente retomando el proyecto | [CONTINUACION.md](CONTINUACION.md) |
| Agente escribiendo código | [../AGENTS.md](../AGENTS.md) → [DESARROLLO.md](DESARROLLO.md) |
| Humano configurando deploy | [OPERACIONES.md](OPERACIONES.md) |
| Entender RSVP/scroll/colores | [MODOS-LECTURA.md](MODOS-LECTURA.md) |

## Índice

| Documento | Contenido |
|-----------|-----------|
| [CONTINUACION.md](CONTINUACION.md) | Handoff: estado, historial, archivos clave, pendientes |
| [ARQUITECTURA.md](ARQUITECTURA.md) | Stack, flujo, capítulos, IndexedDB, PWA |
| [DESARROLLO.md](DESARROLLO.md) | Convenciones, trampas, checklist |
| [MODOS-LECTURA.md](MODOS-LECTURA.md) | RSVP, Bionic, scroll, capítulos, colornames |
| [OPERACIONES.md](OPERACIONES.md) | Deploy, auth, troubleshooting |
| [SEGURIDAD.md](SEGURIDAD.md) | Secretos, Basic Auth, datos locales |

## Assets

- `reader-mobile.png` — captura de referencia UI móvil

## Reglas Cursor

Reglas persistentes en `../.cursor/rules/`:

- `lector-core.mdc` — siempre activa
- `engines.mdc` — motores y parsers
- `ui-reader.mdc` — componentes y estilos
- `deploy-ops.mdc` — deploy y Caddy
