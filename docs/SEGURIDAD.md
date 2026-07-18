# Seguridad — Lector

## Modelo

SPA estática; datos en el cliente. Sin API ni DB en servidor.

| Riesgo | Mitigación |
|--------|------------|
| Acceso no autorizado | HTTP Basic Auth (Caddy) |
| Tránsito | HTTPS (Let's Encrypt) |
| Secretos en repo | `.auth-credentials` en `.gitignore` |
| XSS en contenido | Texto a plain; sin `dangerouslySetInnerHTML` en lectura |

## Basic Auth

- Usuario: `lector`
- Contraseña: solo en `/home/apps/lector/lector-app/.auth-credentials` (servidor)
- Protege **toda** la ruta incluido assets y manifest
- Uso personal/cerrado — no multi-usuario

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
