#!/bin/sh
set -e

# Generate runtime config for Socket.IO
if [ -f /usr/share/nginx/html/config.js.template ]; then
  envsubst '${SOCKET_IO_URL}' < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js
fi

exec nginx -g 'daemon off;'
