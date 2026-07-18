#!/usr/bin/env bash
# Deploy Lector → https://read.otrasmaneras.com
# Ver docs/OPERACIONES.md
set -euo pipefail

APP_DIR="/home/apps/lector/lector-app"
cd "$APP_DIR"

echo "→ Building lector-app..."
npm run build

echo "→ Reloading Caddy..."
caddy validate --config /etc/caddy/Caddyfile
systemctl restart caddy
sleep 2
systemctl is-active --quiet caddy

echo "✓ Deployed to https://read.otrasmaneras.com"
