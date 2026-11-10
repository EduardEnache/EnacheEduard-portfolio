#!/usr/bin/env bash
# Runs a command under the Node version in .nvmrc (Astro 7 needs >= 22.23.4) so the host's default Node stays untouched.
set -e
cd "$(dirname "$0")/.."
want=$(cat .nvmrc); have=$(node -v | tr -d v)
if [ "$(printf '%s\n%s\n' "$want" "$have" | sort -V | head -1)" != "$want" ]; then
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  nvm install >/dev/null # no-op when already installed
  nvm use >/dev/null
fi
exec "$@"
