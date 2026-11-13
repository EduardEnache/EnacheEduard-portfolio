#!/usr/bin/env bash
# One-shot cutover to the Cloudflare Tunnel on eduardenache.ro. Needs CLOUDFLARE_TUNNEL_TOKEN in api/.env.
# Funnel stays on; turn it off yourself afterwards: docker exec tailscale tailscale funnel --https=10000 off
set -euo pipefail
cd "$(dirname "$0")/.."
grep -q '^CLOUDFLARE_TUNNEL_TOKEN=.\+' api/.env || { echo "Set CLOUDFLARE_TUNNEL_TOKEN in api/.env first" >&2; exit 1; }
[ -f .env.next ] && mv .env.next .env # SITE_URL=https://eduardenache.ro
if [ -f api/.env.next ]; then # replace-or-append each KEY=value (ALLOWED_ORIGINS, CF_IP)
  while IFS== read -r k v; do
    [ -n "$k" ] || continue
    keep=$(grep -v "^$k=" api/.env || true)
    printf '%s\n%s=%s\n' "$keep" "$k" "$v" > api/.env
  done < api/.env.next
fi
grep -q '^COMPOSE_PROFILES=' api/.env || echo 'COMPOSE_PROFILES=tunnel' >> api/.env
npm run deploy:local # the profile in api/.env starts cloudflared too
sleep 10
docker logs portfolio-cloudflared 2>&1 | grep -i "registered tunnel connection" || { echo "No registered connections yet; check: docker logs portfolio-cloudflared" >&2; exit 1; }
