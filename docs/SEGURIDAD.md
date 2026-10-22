# Seguridad — Lector

## Modelo

SPA estática; datos en el cliente. Sin API ni DB en servidor.

| Riesgo | Mitigación |
|--------|------------|
| Acceso | Público desde 2026-10-23 (sin Basic Auth): no hay datos en el servidor |
| Tránsito | HTTPS (Let's Encrypt) |
| Secretos en repo | `.auth-credentials` en `.gitignore` |
| XSS en contenido | Texto a plain; sin `dangerouslySetInnerHTML` en lectura |

## Acceso público

Desde 2026-10-23 el sitio es público (se quitó el Basic Auth de Caddy). El servidor solo sirve
archivos estáticos: la app y los libros de dominio público de `public/libros/`. Lo que cada
persona importa queda en su navegador.

## No commitear

```
.auth-credentials
dist/
node_modules/
.env
.env.*
*.local
```

## IndexedDB

- Libros y texto completo en el navegador
- Sin cifrado at-rest
- Borrar datos del sitio = pierde biblioteca

## Headers

`Strict-Transport-Security` en bloque Caddy del sitio.

## Futuro

Multi-usuario o sync requiere backend con auth real — fuera del MVP actual.
