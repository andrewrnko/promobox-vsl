#!/bin/zsh
# Push site/ to the gh-pages branch (GitHub Pages source).
set -e
cd "$(dirname "$0")"
git add -A && git commit -qm "site: $(date +%F_%H%M)" || true
git push -q origin main
git subtree split --prefix site -b gh-pages-tmp >/dev/null
git push -f -q origin gh-pages-tmp:gh-pages
git branch -D gh-pages-tmp >/dev/null
echo "pushed → https://andrewrnko.github.io/promobox-vsl/"
