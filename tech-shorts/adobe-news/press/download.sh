#!/bin/bash
# Downloads the official Adobe announcement images (editorial/news use, credit: Adobe).
cd "$(dirname "$0")"
n=0
while read -r u; do n=$((n+1)); ext="${u##*.}"; curl -sSL -o "adobe_$n.$ext" "$u?width=1600"; done < urls.txt
ls -la adobe_*
