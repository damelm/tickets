# Sistema de Tickets Departamental

Sistema interno de gestión de tickets para comunicación entre empleados y departamentos.

## 📋 Descripción

Sistema que permite a los empleados enviar tickets a diferentes departamentos de la empresa y realizar seguimiento de sus solicitudes. Los agentes de cada departamento pueden gestionar y responder los tickets asignados a su área.

## 👥 Usuarios del Sistema

### Empleado (400 usuarios)
- Crear tickets dirigidos a departamentos específicos
- Ver estado de sus propios tickets
- Recibir actualizaciones y respuestas

### Agente de Departamento
- Ver tickets asignados a su departamento
- Gestionar tickets: asignar, cambiar estado, comentar
- Vistas Kanban y Lista para organización

### Admin/SuperAdmin
- Configurar qué departamentos pueden recibir tickets
- Gestionar usuarios y asignar roles
- Administrar departamentos (18 departamentos en total)

## 🎯 Estados del Ticket

- **Backlog** - Ticket recibido, sin asignar
- **To Do** - Asignado, pendiente de inicio
- **In Progress** - En proceso de resolución
- **Review** - En revisión
- **Done** - Resuelto/Cerrado

## 📊 Vistas Principales

### Para Empleados
- Formulario de creación de tickets
- Lista "Mis Tickets"
- Detalle de ticket con comentarios

### Para Agentes
- Vista Kanban (gestión visual por estados)
- Vista Lista (tabla filtrable)
- Detalle de ticket (trabajar y responder)

### Para Admins
- Configuración de departamentos
- Gestión de usuarios
- Dashboard de estadísticas

## 🏗️ Stack Tecnológico (Propuesto)

- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL
- **Frontend:** React + Vite + Tailwind CSS
- **Autenticación:** JWT

## 📐 Diseño

Los mockups visuales están en la carpeta `/design`:
- Vista Kanban y Lista interactivas
- Diseño profesional similar a Linear/JIRA
- Sistema responsive y accesible

## 🚀 Estado del Proyecto

**Fase actual:** MVP funcional + login con Google + hardening en curso
- ✅ Modelo de datos definido
- ✅ Mockups de las 10 vistas (`/design`)
- ✅ Backend: esquema, migraciones, auth JWT y API REST completa (`/server`)
- ✅ Frontend: las 10 pantallas conectadas a la API real (`/client`)
- ✅ Pantalla de configuración de admin (`app_settings`)
- ✅ Login con Google (identidad) + contraseña oculta (respaldo) — falta generar el `GOOGLE_CLIENT_ID` real
- ✅ Rate limiting, tests automatizados en rutas críticas de auth/autorización
- ⏳ Pendiente: lint, forma de deploy productiva (Docker + Netbird)

### Cómo correrlo en local

```bash
cp .env.example .env
docker compose up -d        # levanta Postgres
cd server && npm install && npm run migrate && npm run seed && npm run dev
cd client && npm install && npm run dev
```

Credenciales de desarrollo en `server/SEED_CREDENTIALS.local.md` (no versionado).

### Tests automatizados

Los tests corren contra una base Postgres separada (`tickets_test`), nunca contra la de desarrollo:

```bash
docker exec <container_postgres> psql -U changeme -d tickets -c "CREATE DATABASE tickets_test"
cd server && npm run migrate:test && npm run test
```

## 📈 Escalabilidad

Sistema diseñado para soportar:
- 400 usuarios concurrentes
- 18 departamentos
- Miles de tickets
- Optimizado con índices, paginación y connection pooling
