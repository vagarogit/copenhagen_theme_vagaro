#!/usr/bin/env bash
# Starts the zcli theme server over HTTPS on the LAN so a phone can load the
# preview. Used by `yarn start:lan`; `yarn start` is unaffected.
#
# HTTPS is not optional here. support.vagaro.com is served over TLS, so every
# asset it pulls from theme_server_url is subject to mixed-content blocking.
# http://localhost is exempt (browsers treat it as a potentially trustworthy
# origin); http://<lan-ip> is not, and Safari drops the stylesheet and scripts,
# leaving you on what looks like the published theme.
set -euo pipefail

CERT_DIR="$HOME/.config/zcli-certs"
CERT="$CERT_DIR/lan.pem"
KEY="$CERT_DIR/lan-key.pem"
PORT="${PORT:-4567}"

IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
if [ -z "$IP" ]; then
  echo "lan-preview: no LAN address on en0/en1 — are you on Wi-Fi?" >&2
  exit 1
fi

# The address is DHCP-assigned, so re-mint the cert whenever it moves rather
# than failing with an opaque TLS error on the phone.
if [ ! -f "$CERT" ] || ! openssl x509 -in "$CERT" -noout -ext subjectAltName 2>/dev/null | grep -q "IP Address:$IP"; then
  echo "lan-preview: minting a certificate for $IP"
  command -v mkcert >/dev/null || { echo "lan-preview: mkcert not installed (brew install mkcert)" >&2; exit 1; }
  mkdir -p "$CERT_DIR"
  mkcert -cert-file "$CERT" -key-file "$KEY" "$IP" localhost 127.0.0.1
  echo "lan-preview: install $(mkcert -CAROOT)/rootCA.pem on the device and trust it fully"
fi

cat <<EOF

  Open this on the device (the whole URL, every time — a reload drops the
  preview and silently serves the published theme, which has no Vera widget):

  https://support.vagaro.com/hc/admin/local_preview/start?theme_server_url=https://$IP:$PORT

EOF

exec zcli themes:preview --bind 0.0.0.0 --port "$PORT" --https-cert "$CERT" --https-key "$KEY"
