#!/usr/bin/env bash
# Greps every endpoint's live output for private patterns. Usage: ./leakcheck.sh [base-url]
base=${1:-http://127.0.0.1:${HOST_PORT:-8506}}
out=$(for p in health anuntulcasei minecraft all; do curl -fsS -m5 "$base/v1/$p" || { echo "FETCH FAILED $p" >&2; exit 2; }; done)
pat='(^|[^0-9])(10\.[0-9]+\.[0-9]+\.[0-9]+|192\.168\.[0-9]+\.[0-9]+|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]+\.[0-9]+|100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\.[0-9]+\.[0-9]+)|\.ts\.net|token|password|secret|'"$(cat /etc/hostname)"
if grep -Eiq "$pat" <<<"$out"; then echo "LEAK:"; grep -Eio "$pat" <<<"$out"; exit 1; fi
echo "leak check passed"
