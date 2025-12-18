# Sistema de Tickets de Soporte Técnico - Siete Fronteras

Sistema completo de gestión de tickets de soporte técnico para uso interno.

## Características

### 3 Niveles de Acceso

1. **Público** (sin login): Crear nuevos tickets mediante wizard intuitivo
2. **Auxiliar/Técnico** (con login): Gestionar tickets asignados
3. **Administrador** (con login): Control total del sistema

### Funcionalidades Principales

- ✅ Wizard de 4 pasos para crear tickets
- ✅ Sistema automático de SLA con alertas
- ✅ Notificaciones por email en tiempo real
- ✅ Autocierre automático de tickets resueltos
- ✅ Dashboard con métricas en tiempo real
- ✅ Reportes y analytics avanzados
- ✅ Gestión completa de usuarios y configuraciones
- ✅ Diseño responsive y moderno

## Instalación

### Requisitos Previos

- Node.js 18+
- npm o yarn

### Pasos de Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd tickets
```

2. Instalar dependencias del backend
```bash
npm install
```

3. Instalar dependencias del frontend
```bash
cd client
npm install
cd ..
```

4. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

5. Inicializar base de datos y crear usuario administrador
```bash
npm run setup
```

6. Iniciar en modo desarrollo
```bash
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Usuario Administrador Por Defecto

Después de ejecutar `npm run setup`, se creará un usuario administrador:

- **Email**: admin@sietefronteras.com.py
- **Contraseña**: Admin123!

⚠️ **IMPORTANTE**: Cambiar estas credenciales después del primer login.

## Estructura del Proyecto

```
tickets/
├── server/               # Backend (Node.js + Express)
│   ├── index.js         # Servidor principal
│   ├── database.js      # Configuración de base de datos
│   ├── setup.js         # Script de inicialización
│   ├── routes/          # Rutas de la API
│   ├── middleware/      # Middlewares (auth, etc)
│   ├── services/        # Lógica de negocio
│   └── utils/           # Utilidades
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas principales
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API calls
│   │   └── utils/       # Utilidades
│   └── package.json
├── database/            # Base de datos SQLite
└── package.json
```

## Uso

### Acceso Público

Visitar http://localhost:5173 y completar el wizard para crear un ticket.

### Acceso Técnico

1. Login con credenciales de auxiliar
2. Ver dashboard con métricas personales
3. Tomar tickets sin asignar
4. Gestionar tickets asignados

### Acceso Administrador

1. Login con credenciales de admin
2. Acceder a todos los módulos:
   - Gestión completa de tickets
   - Reportes y analytics
   - Configuración del sistema
   - Gestión de usuarios

## Configuración

### SLA (Service Level Agreement)

Configurar tiempos de SLA desde el panel de administrador:
- Crítica: 4 horas (default)
- Alta: 8 horas (default)
- Media: 24 horas (default)
- Baja: 72 horas (default)

### Notificaciones Email

Configurar SMTP en el archivo `.env`:
- Para Gmail: Usar app password
- Para otros: Configurar host, puerto y credenciales

### Autocierre

Los tickets en estado "Resuelto" se cierran automáticamente después de 72 horas (configurable).

## Producción

### Build

```bash
npm run build
```

### Iniciar

```bash
npm start
```

### Variables de Entorno

Asegurarse de configurar correctamente:
- `NODE_ENV=production`
- `JWT_SECRET` con valor seguro
- `FRONTEND_URL` con dominio real
- Credenciales de email válidas

## Soporte Técnico

Para consultas y soporte, contactar al departamento de IT.

## Licencia

Uso interno - Siete Fronteras, Paraguay
