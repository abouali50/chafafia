#!/usr/bin/env bash
# Chafafia — installation de la maquette sur un VPS (Caddy ou nginx).
# Auteur : Aziz Mernissi
# Usage : bash deploy.sh mon-sous-domaine.exemple.com
# Ne modifie aucun site existant : ajoute seulement un nouveau bloc de site,
# après sauvegarde, et annule tout si le serveur web refuse la configuration.
set -euo pipefail

DOMAIN="${1:-}"
REPO="https://github.com/abouali50/chafafia.git"
DIR="${CHAFAFIA_DIR:-/var/www/chafafia}"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
NAME="chafafia"

say() { printf '\n==> %s\n' "$*"; }

if [ -z "$DOMAIN" ]; then
  echo "Il manque le nom de domaine. Exemple : bash deploy.sh chafafia.exemple.com"
  exit 1
fi
if [ "$(id -u)" -ne 0 ]; then
  echo "Lancez cette commande en tant que root (terminal Hostinger)."
  exit 1
fi

if command -v caddy >/dev/null 2>&1 && [ -f "$CADDYFILE" ]; then
  SERVER="caddy"
elif command -v nginx >/dev/null 2>&1; then
  SERVER="nginx"
else
  echo "Ni Caddy ni nginx trouvés sur ce serveur. Rien n'a été modifié."
  echo "Envoyez ce message tel quel pour obtenir la commande adaptée."
  exit 1
fi

say "Téléchargement de la maquette"
command -v git >/dev/null 2>&1 || { apt-get update -y && apt-get install -y git; }
mkdir -p "$(dirname "$DIR")"
if [ -d "$DIR/.git" ]; then
  git -C "$DIR" pull --ff-only
else
  rm -rf "$DIR"
  git clone --depth 1 "$REPO" "$DIR"
fi
chmod -R a+rX "$DIR"

say "Configuration du site $DOMAIN ($SERVER)"

if [ "$SERVER" = "caddy" ]; then
  if grep -qF "$DOMAIN" "$CADDYFILE"; then
    echo "Le site est déjà déclaré dans Caddy : fichiers mis à jour, configuration inchangée."
  else
    BACKUP="$CADDYFILE.avant-$NAME.$(date +%Y%m%d-%H%M%S)"
    cp -p "$CADDYFILE" "$BACKUP"
    echo "Sauvegarde : $BACKUP"
    cat >> "$CADDYFILE" <<EOF

# Chafafia — maquette (ajouté par deploy.sh)
$DOMAIN {
	root * $DIR
	@prive path /.git /.git/* /deploy.sh /README.md
	respond @prive 404
	file_server
}
EOF
    if ! caddy validate --config "$CADDYFILE" --adapter caddyfile >"/tmp/$NAME-caddy.log" 2>&1; then
      cp -p "$BACKUP" "$CADDYFILE"
      echo "Caddy refuse la configuration : annulation, vos autres sites ne sont pas touchés."
      tail -n 5 "/tmp/$NAME-caddy.log"
      exit 1
    fi
    if ! { systemctl reload caddy 2>/dev/null || caddy reload --config "$CADDYFILE" --adapter caddyfile; }; then
      cp -p "$BACKUP" "$CADDYFILE"
      systemctl reload caddy 2>/dev/null || true
      echo "Le rechargement de Caddy a échoué : configuration précédente restaurée."
      exit 1
    fi
  fi
  say "Terminé"
  echo "Caddy active le HTTPS tout seul (comptez une minute la première fois)."
  echo "Ouvrez : https://$DOMAIN"
  exit 0
fi

# --- nginx ---
if [ -d /etc/nginx/sites-available ]; then
  CONF="/etc/nginx/sites-available/$NAME"
  LINK="/etc/nginx/sites-enabled/$NAME"
else
  CONF="/etc/nginx/conf.d/$NAME.conf"
  LINK=""
fi

if [ -f "$CONF" ] && grep -q "ssl_certificate" "$CONF"; then
  echo "Configuration HTTPS déjà en place, conservée."
else
  cat > "$CONF" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    root $DIR;
    index index.html;
    location / { try_files \$uri \$uri/ /index.html; }
    location ~ /\.git { deny all; }
    location = /deploy.sh { deny all; }
}
EOF
  if [ -n "$LINK" ]; then ln -sf "$CONF" "$LINK"; fi
fi

if ! nginx -t; then
  echo "La configuration nginx est refusée : annulation, vos autres sites ne sont pas touchés."
  rm -f "$CONF"
  if [ -n "$LINK" ]; then rm -f "$LINK"; fi
  exit 1
fi
systemctl reload nginx

say "Certificat HTTPS"
if command -v certbot >/dev/null 2>&1; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --redirect --keep-until-expiring \
    --register-unsafely-without-email \
    || echo "HTTPS non activé (le DNS n'est peut-être pas encore propagé). Relancez la même commande dans 10 minutes."
else
  echo "certbot absent : le site fonctionne en http pour l'instant."
fi

say "Terminé"
echo "Ouvrez : https://$DOMAIN  (ou http://$DOMAIN si le HTTPS n'est pas encore actif)"
