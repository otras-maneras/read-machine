# Operaciones — Lector

## Producción

| Item | Valor |
|------|-------|
| URL | https://read.otrasmaneras.com |
| App | `/home/apps/lector/lector-app` |
| Static | `/home/apps/lector/lector-app/dist` |
| Caddy | `/etc/caddy/Caddyfile` → `read.otrasmaneras.com` |
| Auth | HTTP Basic — usuario **`lector`** |

## Credenciales

Archivo en servidor (no git):

```
/home/apps/lector/lector-app/.auth-credentials
```

Contiene `USER`, `PASS` y `HASH` (bcrypt para Caddyfile).  
Plantilla: [.auth-credentials.example](../.auth-credentials.example)

### Rotar contraseña

```bash
PASS=$(openssl rand -base64 16)
HASH=$(caddy hash-password --plaintext "$PASS")
echo "USER=lector" > /home/apps/lector/lector-app/.auth-credentials
echo "PASS=$PASS" >> /home/apps/lector/lector-app/.auth-credentials
echo "HASH=$HASH" >> /home/apps/lector/lector-app/.auth-credentials
chmod 600 /home/apps/lector/lector-app/.auth-credentials
# Actualizar hash en /etc/caddy/Caddyfile
systemctl restart caddy
```

## Deploy

```bash
cd /home/apps/lector/lector-app
./deploy.sh
```

1. `npm run build`
2. `caddy validate`
3. `systemctl restart caddy` (no `caddy reload` si `admin off`)

## Desarrollo local

```bash
npm run dev        # :5173, sin auth
npm run build && npm run preview
```

## PWA

Tras deploy: **Ctrl+Shift+R** o borrar datos del sitio si la UI no actualiza.

## Troubleshooting

| Problema | Causa | Acción |
|----------|-------|--------|
| 401 | Basic auth | Credenciales en `.auth-credentials` |
| Capítulos repetidos / play no avanza | Bugs conocidos (jul 2026) | Ver [CONTINUACION.md](CONTINUACION.md); no reintroducir offsets manuales ni pause en cleanup |
| ePub crash | Spine como array | `spine.get(i)` |
| Scroll trabado | Auto-scroll agresivo | Solo scroll al cambiar capítulo |
| UI vieja post-deploy | Service worker | Hard refresh |
| Manifest 401 | Basic auth | Inofensivo |
| `caddy reload` falla | `admin off` | `systemctl restart caddy` |

## Datos y backups

- Libros en **IndexedDB del navegador** — no hay DB en servidor.
- Código: git **no inicializado** aún; recomendable en `lector-app`.

## Logs

```bash
journalctl -u caddy -f
```

## Archivos de prueba

```
/home/apps/lector/shirah-reader/assets/alice.epub
```

## ePub de prueba en browser

Importar alice.epub → RSVP play → cruzar capítulos → selector de capítulo → scroll + lectura rápida.
