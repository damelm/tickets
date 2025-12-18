# Guía de Instalación y Configuración
## Sistema de Tickets - Siete Fronteras

### Requisitos del Sistema

- **Node.js**: versión 18 o superior
- **npm**: versión 8 o superior
- **Sistema Operativo**: Windows, Linux o macOS

### Instalación Paso a Paso

#### 1. Instalar Dependencias del Backend

```bash
npm install
```

Esto instalará todas las dependencias necesarias del servidor:
- Express (servidor web)
- SQLite (base de datos)
- JWT (autenticación)
- Nodemailer (emails)
- bcryptjs (seguridad)

#### 2. Instalar Dependencias del Frontend

```bash
cd client
npm install
cd ..
```

Esto instalará:
- React (framework frontend)
- Vite (build tool)
- Tailwind CSS (estilos)
- Axios (HTTP client)
- React Router (navegación)

#### 3. Configurar Variables de Entorno

El archivo `.env` ya está creado en la raíz del proyecto. **IMPORTANTE**: Debes configurar el sistema de email:

Abre el archivo `.env` y configura:

**Para usar Gmail:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=soporte@sietefronteras.com.py
```

**Cómo obtener App Password de Gmail:**
1. Ve a tu cuenta de Google
2. Seguridad → Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña para "Correo"
5. Copia la contraseña de 16 caracteres

**Para otros proveedores SMTP:**
- Outlook/Hotmail: `smtp.office365.com`, puerto 587
- Yahoo: `smtp.mail.yahoo.com`, puerto 587
- Servidor propio: Configura según tu proveedor

**Para deshabilitar emails (testing):**
Edita `server/database.js` línea 54 o modifica la config en la base de datos.

#### 4. Inicializar Base de Datos y Crear Admin

```bash
npm run setup
```

Este comando:
1. Crea la base de datos SQLite en `database/tickets.db`
2. Crea todas las tablas necesarias
3. Inserta configuraciones por defecto
4. Te solicita crear un usuario administrador

**Sigue las instrucciones en pantalla:**
- Nombre completo: (ej: "Juan Pérez")
- Email: (ej: "admin@sietefronteras.com.py")
- Contraseña: (mínimo 6 caracteres)

**Guarda las credenciales**, las necesitarás para el primer login.

#### 5. Iniciar la Aplicación en Modo Desarrollo

```bash
npm run dev
```

Esto iniciará:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

**La aplicación se abrirá automáticamente en tu navegador.**

### Acceso a la Aplicación

#### Modo Público (Sin Login)
- URL: http://localhost:5173
- Cualquier usuario puede crear tickets
- No requiere autenticación

#### Login para Técnicos/Administradores
- URL: http://localhost:5173/login
- Usar credenciales creadas en el paso 4

### Crear Usuarios Adicionales

Una vez dentro como administrador:

1. Ir a Dashboard
2. Pestaña "⚙️ Configuración"
3. Sección "👥 Gestión de Usuarios"
4. Click en "➕ Agregar Usuario"
5. Completar datos:
   - Email
   - Contraseña (mínimo 6 caracteres)
   - Nombre completo
   - Rol: "Admin" o "Auxiliar"
   - Estado: Activo

### Configuración del Sistema

#### Configurar SLA (Service Level Agreement)

1. Dashboard Admin → Configuración → SLA
2. Establecer horas límite para cada prioridad:
   - **Crítica**: 4 horas (default)
   - **Alta**: 8 horas (default)
   - **Media**: 24 horas (default)
   - **Baja**: 72 horas (default)

#### Configurar Autocierre

1. Dashboard Admin → Configuración → Autocierre
2. Establecer horas después de "Resuelto" para cierre automático
3. Default: 72 horas

### Despliegue en Producción

#### 1. Build de Producción

```bash
# Build del frontend
cd client
npm run build
cd ..
```

#### 2. Configurar Variables de Entorno

Editar `.env`:
```env
NODE_ENV=production
JWT_SECRET=CAMBIAR-POR-SECRETO-SEGURO-ALEATORIO
FRONTEND_URL=https://tu-dominio.com
```

#### 3. Iniciar Servidor

```bash
npm start
```

#### 4. Servir con PM2 (Recomendado)

```bash
npm install -g pm2
pm2 start server/index.js --name tickets
pm2 save
pm2 startup
```

### Solución de Problemas

#### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

#### Error: "EADDRINUSE port 3001"
```bash
# Cambiar puerto en .env
PORT=3002
```

#### Emails no se envían
1. Verificar credenciales SMTP en `.env`
2. Para Gmail, verificar App Password
3. Revisar logs del servidor
4. Verificar que `email_enabled` esté en `true` en la BD

#### Base de datos bloqueada
```bash
# Eliminar base de datos y recrear
rm database/tickets.db*
npm run setup
```

### Estructura de Archivos

```
tickets/
├── server/              # Backend Node.js
│   ├── routes/         # Rutas de la API
│   ├── middleware/     # Autenticación
│   ├── services/       # Email, autocierre
│   └── utils/          # Utilidades SLA
├── client/             # Frontend React
│   └── src/
│       ├── components/ # Componentes reutilizables
│       ├── pages/      # Páginas principales
│       ├── services/   # API calls
│       └── context/    # Estado global
├── database/           # Base de datos SQLite
├── .env               # Variables de entorno
└── package.json       # Dependencias
```

### Respaldo y Mantenimiento

#### Backup de Base de Datos

```bash
# Crear backup
cp database/tickets.db database/backup-$(date +%Y%m%d).db

# Restaurar backup
cp database/backup-YYYYMMDD.db database/tickets.db
```

#### Logs del Sistema

Los logs se muestran en la consola. Para producción:

```bash
pm2 logs tickets
```

### Soporte

Para problemas o consultas:
- Email: soporte@sietefronteras.com.py
- Contactar al departamento de IT

---

**¡Sistema listo para usar!** 🎉
