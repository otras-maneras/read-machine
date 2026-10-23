#!/usr/bin/env bash
# Build de producción de Read Machine. El resultado (dist/) se sirve como sitio
# estático; ver docs/OPERACIONES.md.
set -euo pipefail

cd "$(dirname "$0")"

echo "→ Build..."
npm run build

echo "✓ Listo: dist/ actualizado"
