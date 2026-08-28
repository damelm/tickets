#!/usr/bin/env bash
# Corre DENTRO del contenedor postgres (docker exec o cron del host apuntando ahí).
# Uso: docker exec <container_postgres> bash /backups/../scripts... o copiado a /backups.
set -euo pipefail

BACKUP_DIR="/backups"
STAMP=$(date +%F)

pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$BACKUP_DIR/tickets-$STAMP.sql.gz"
find "$BACKUP_DIR" -name 'tickets-*.sql.gz' -mtime +14 -delete

echo "backup: $BACKUP_DIR/tickets-$STAMP.sql.gz"
