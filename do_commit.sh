#!/bin/bash
cd /home/ubuntu/axeapp-web
git add "app/(public)/page.tsx" public/logo.png
git commit -m "feat: novo logo + secao BuyMeACoffee

- Substitui logo antigo pelo novo logo do AxeApp
- Adiciona secao O Axe se sustenta com amor
- Link buymeacoffee.com/axeapp
- Design em tons ambar com texto emocional"
git push origin main
