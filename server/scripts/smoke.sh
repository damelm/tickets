#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:3001/api"
PASS="devpass123"

login() {
  curl -s -X POST "$BASE/auth/login" -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$PASS\"}" | node -pe 'JSON.parse(require("fs").readFileSync(0)).token'
}

check() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "OK   $desc ($actual)"
  else
    echo "FAIL $desc (esperado $expected, obtuve $actual)"
  fi
}

EMP=$(login maria.gomez@empresa.com)
AGT=$(login sebastian.ruiz@empresa.com)
ADM=$(login andres.lopez@empresa.com)

status() { curl -s -o /dev/null -w "%{http_code}" "$@"; }

echo "--- auth ---"
check "login invalido" 401 "$(curl -s -o /dev/null -w '%{http_code}' -X POST $BASE/auth/login -H 'Content-Type: application/json' -d '{"email":"maria.gomez@empresa.com","password":"mal"}')"

echo "--- departamentos ---"
check "empleado lee deptos (solo activos)" 200 "$(status $BASE/departments -H "Authorization: Bearer $EMP")"
check "agente no puede togglear" 403 "$(status -X PATCH $BASE/departments/1/toggle -H "Authorization: Bearer $AGT" -H 'Content-Type: application/json' -d '{"acceptsTickets":true}')"
check "admin puede togglear" 200 "$(status -X PATCH $BASE/departments/1/toggle -H "Authorization: Bearer $ADM" -H 'Content-Type: application/json' -d '{"acceptsTickets":true}')"

echo "--- usuarios (admin only) ---"
check "empleado no puede listar usuarios" 403 "$(status $BASE/users -H "Authorization: Bearer $EMP")"
check "admin lista usuarios" 200 "$(status $BASE/users -H "Authorization: Bearer $ADM")"

echo "--- tickets ---"
TICKET_ID=$(curl -s -X POST $BASE/tickets -H "Authorization: Bearer $EMP" -H 'Content-Type: application/json' \
  -d '{"departmentId":2,"subject":"Prueba smoke","description":"desc","priority":"media"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).id')
check "empleado crea ticket" 201 "$(status -X POST $BASE/tickets -H "Authorization: Bearer $EMP" -H 'Content-Type: application/json' -d '{"departmentId":2,"subject":"otro","description":"desc","priority":"media"}')"
check "agente no puede crear ticket" 403 "$(status -X POST $BASE/tickets -H "Authorization: Bearer $AGT" -H 'Content-Type: application/json' -d '{"departmentId":2,"subject":"x","description":"y","priority":"media"}')"

check "empleado ve mis tickets" 200 "$(status $BASE/tickets/mine -H "Authorization: Bearer $EMP")"
check "agente lista tickets de su depto" 200 "$(status $BASE/tickets -H "Authorization: Bearer $AGT")"
check "empleado no puede listar filtrado" 403 "$(status $BASE/tickets -H "Authorization: Bearer $EMP")"

check "agente ve detalle de ticket de su depto" 200 "$(status $BASE/tickets/$TICKET_ID -H "Authorization: Bearer $AGT")"
check "agente cambia estado" 200 "$(status -X PATCH $BASE/tickets/$TICKET_ID/status -H "Authorization: Bearer $AGT" -H 'Content-Type: application/json' -d '{"status":"in_progress"}')"
check "agente comenta" 201 "$(status -X POST $BASE/tickets/$TICKET_ID/comments -H "Authorization: Bearer $AGT" -H 'Content-Type: application/json' -d '{"body":"probando"}')"
check "empleado ve el comentario en el detalle" 200 "$(status $BASE/tickets/$TICKET_ID -H "Authorization: Bearer $EMP")"

echo "--- scoping por departamento ---"
LEGAL_AGT=$(login laura.fernandez@empresa.com)
check "agente de otro depto NO puede ver el ticket" 403 "$(status $BASE/tickets/$TICKET_ID -H "Authorization: Bearer $LEGAL_AGT")"

echo "--- sin token ---"
check "sin token" 401 "$(status $BASE/tickets/mine)"

echo "smoke test terminado"
