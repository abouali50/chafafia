#!/usr/bin/env bash
# Chafafia — installation et mise à jour de l'application sur un VPS (Docker + Caddy).
# Auteur : Aziz Mernissi
# Usage : bash deploy.sh mon-sous-domaine.exemple.com
#
# Sécurité de l'installation :
#  - l'application démarre et répond AVANT que Caddy soit modifié ;
#  - le Caddyfile est sauvegardé, vérifié par Caddy, et restauré en cas de refus ;
#  - la base de données est sauvegardée avant chaque mise à jour ;
#  - aucun autre site du serveur n'est modifié.
set -euo pipefail

DOMAIN="${1:-}"
REPO="${CHAFAFIA_REPO:-https://github.com/abouali50/chafafia.git}"
APP_DIR="${CHAFAFIA_APP_DIR:-/opt/chafafia}"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"

say() { printf '\n==> %s\n' "$*"; }
stop() { printf '\n%s\n' "$*"; exit 1; }

[ -n "$DOMAIN" ] || stop "Il manque le nom de domaine. Exemple : bash deploy.sh chafafia.exemple.com"
[ "$(id -u)" -eq 0 ] || stop "Lancez cette commande en tant que root (terminal Hostinger)."
command -v docker >/dev/null 2>&1 || stop "Docker n'est pas installé sur ce serveur. Rien n'a été modifié."
docker compose version >/dev/null 2>&1 || stop "Le module « docker compose » est absent. Rien n'a été modifié."
{ command -v caddy >/dev/null 2>&1 && [ -f "$CADDYFILE" ]; } || stop "Caddy ou son fichier $CADDYFILE est introuvable. Rien n'a été modifié."
command -v python3 >/dev/null 2>&1 || stop "python3 est introuvable. Rien n'a été modifié."

# Le domaine ne doit pas déjà appartenir à un autre site que Chafafia.
if grep -qF "$DOMAIN" "$CADDYFILE" && ! grep -B1 -F "$DOMAIN {" "$CADDYFILE" | grep -q '^# Chafafia'; then
  stop "Le domaine $DOMAIN est déjà utilisé par un autre site dans Caddy. Rien n'a été modifié."
fi

say "Téléchargement de l'application"
command -v git >/dev/null 2>&1 || { apt-get update -y && apt-get install -y git; }
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  if [ -f data/chafafia.db ]; then
    docker compose stop >/dev/null 2>&1 || true
    mkdir -p data/backups
    BK="data/backups/chafafia-$(date +%Y%m%d-%H%M%S).db"
    cp -p data/chafafia.db "$BK"
    for ext in wal shm; do if [ -f "data/chafafia.db-$ext" ]; then cp -p "data/chafafia.db-$ext" "$BK-$ext"; fi; done
    echo "Sauvegarde de la base : $APP_DIR/$BK"
  fi
  git pull --ff-only
else
  mkdir -p "$(dirname "$APP_DIR")"
  git clone --depth 1 "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

say "Préparation"
port_free() { ! ss -tln 2>/dev/null | grep -qE "[:.]$1[[:space:]]"; }
if [ -f .env ]; then
  # shellcheck disable=SC1091
  . ./.env
fi
if [ -z "${CHAFAFIA_PORT:-}" ]; then
  for p in $(seq 3220 3260); do if port_free "$p"; then CHAFAFIA_PORT="$p"; break; fi; done
  [ -n "${CHAFAFIA_PORT:-}" ] || stop "Aucun port libre entre 3220 et 3260. Rien n'a été modifié dans Caddy."
fi
if [ -z "${CHAFAFIA_SETUP_CODE:-}" ]; then
  CHAFAFIA_SETUP_CODE="$(python3 -c 'import secrets; print(secrets.randbelow(900000) + 100000)')"
fi
printf 'CHAFAFIA_PORT=%s\nCHAFAFIA_SETUP_CODE=%s\n' "$CHAFAFIA_PORT" "$CHAFAFIA_SETUP_CODE" > .env
chmod 600 .env
mkdir -p data
chown -R 1000:1000 data
echo "Port interne : $CHAFAFIA_PORT"

say "Démarrage de l'application"
docker compose up -d --remove-orphans
HEALTH="http://127.0.0.1:$CHAFAFIA_PORT/api/health"
OK=""
for _ in $(seq 1 40); do
  if curl -fsS --max-time 3 "$HEALTH" >/dev/null 2>&1; then OK=1; break; fi
  sleep 2
done
if [ -z "$OK" ]; then
  echo "L'application ne répond pas. Caddy n'a pas été modifié. Dernières lignes du journal :"
  docker compose logs --tail 30 || true
  exit 1
fi
echo "L'application répond."

say "Configuration de Caddy pour $DOMAIN"
BACKUP="$CADDYFILE.avant-chafafia.$(date +%Y%m%d-%H%M%S)"
cp -p "$CADDYFILE" "$BACKUP"
CHANGED="$(DOMAIN="$DOMAIN" PORT="$CHAFAFIA_PORT" CADDYFILE="$CADDYFILE" python3 - <<'PY'
import os
domain, port, path = os.environ['DOMAIN'], os.environ['PORT'], os.environ['CADDYFILE']
block = ["# Chafafia — application (ajouté par deploy.sh)", domain + " {", "\tencode gzip", "\treverse_proxy 127.0.0.1:" + port, "}"]
lines = open(path, encoding='utf-8').read().split('\n')
start = next((i for i, l in enumerate(lines[:-1]) if l.startswith('# Chafafia') and lines[i + 1].strip() == domain + ' {'), None)
if start is None:
    while lines and lines[-1].strip() == '':
        lines.pop()
    new = lines + [''] + block + ['']
else:
    end = next(i for i in range(start + 2, len(lines)) if lines[i] == '}')
    new = lines[:start] + block + lines[end + 1:]
if new == lines:
    print('non')
else:
    open(path, 'w', encoding='utf-8').write('\n'.join(new))
    print('oui')
PY
)"
if [ "$CHANGED" = "oui" ]; then
  echo "Sauvegarde : $BACKUP"
  if ! caddy validate --config "$CADDYFILE" --adapter caddyfile >/tmp/chafafia-caddy.log 2>&1; then
    cp -p "$BACKUP" "$CADDYFILE"
    echo "Caddy refuse la configuration : annulation, vos autres sites ne sont pas touchés."
    tail -n 5 /tmp/chafafia-caddy.log
    exit 1
  fi
  if ! { systemctl reload caddy 2>/dev/null || caddy reload --config "$CADDYFILE" --adapter caddyfile; }; then
    cp -p "$BACKUP" "$CADDYFILE"
    systemctl reload caddy 2>/dev/null || true
    echo "Le rechargement de Caddy a échoué : configuration précédente restaurée."
    exit 1
  fi
else
  rm -f "$BACKUP"
  echo "Caddy est déjà configuré : rien à changer."
fi

say "Terminé"
echo "Application   : https://$DOMAIN"
echo "Démonstration : https://$DOMAIN/demo"
if curl -fsS --max-time 3 "http://127.0.0.1:$CHAFAFIA_PORT/api/me" 2>/dev/null | grep -q '"setup":true'; then
  echo
  echo "PREMIÈRE INSTALLATION : ouvrez l'adresse ci-dessus et créez le compte du bureau."
  echo "Code d'installation à saisir : $CHAFAFIA_SETUP_CODE"
fi
echo "Données (base et fichiers) : $APP_DIR/data"
