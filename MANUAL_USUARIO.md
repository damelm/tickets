# Manual de Usuario
## Sistema de Tickets de Soporte Técnico - Siete Fronteras

---

## 🎯 Para Empleados (Crear Tickets)

### Cómo Crear un Ticket de Soporte

1. **Acceder al Sistema**
   - Abrir navegador web
   - Ir a: http://localhost:5173 (o la URL de tu empresa)
   - NO necesitas login, es acceso público

2. **Completar el Wizard (4 Pasos)**

   **PASO 1: Describir el Problema**
   - Escribe un título breve y claro
   - Ejemplo: "No puedo imprimir documentos"
   - Máximo 100 caracteres

   **PASO 2: Seleccionar Categoría**
   - Haz click en la categoría que mejor describa tu problema:
     - 🖥️ Equipos y Hardware (PC, impresoras, teclados...)
     - 🌐 Conectividad y Red (Internet, WiFi...)
     - 🔐 Accesos y Cuentas (Passwords, permisos...)
     - 💻 Software y Aplicaciones (Programas, Office...)
     - 📞 Telefonía y Comunicación (Teléfonos, videollamadas...)
     - 📦 Otros / Consultas

   **PASO 3: Indicar Urgencia**
   - **Baja**: Puede esperar
   - **Media**: Normal (seleccionado por defecto)
   - **Alta**: Afecta mi trabajo
   - **Crítica**: Bloqueante urgente

   **PASO 4: Detalles del Ticket**
   - **Descripción detallada**: Explica:
     * ¿Qué estabas haciendo cuando ocurrió?
     * ¿Qué mensaje de error aparece?
     * ¿Desde cuándo ocurre?
   - **Nombre completo**: Tu nombre
   - **Email**: Recibirás actualizaciones por correo
   - **Sede**: Selecciona tu ubicación
   - **Comentarios adicionales** (opcional)

3. **Enviar Ticket**
   - Click en "Crear Ticket"
   - Verás un número de ticket (ej: #123)
   - **Guarda este número para seguimiento**

4. **Confirmación por Email**
   - Recibirás un email con:
     - Número de ticket
     - Resumen del problema
     - Estado actual

### Qué Esperar Después

1. **Email de Confirmación**: Inmediato
2. **Asignación a Técnico**: Recibirás email cuando un técnico tome tu ticket
3. **Actualizaciones**: Te notificaremos cada cambio de estado
4. **Resolución**: Cuando se resuelva, recibirás la solución por email
5. **Cierre Automático**: El ticket se cierra solo después de 72 horas de resuelto

---

## 👨‍💻 Para Técnicos/Auxiliares

### Acceso al Sistema

1. Ir a: http://localhost:5173/login
2. Ingresar email y contraseña
3. Click en "Iniciar Sesión"

### Panel de Técnico

#### Dashboard Principal

**Métricas Visibles:**
- **Mis Tickets**: Total asignados a ti
- **🔥 Críticos**: Tickets urgentes
- **👤 Sin Asignar**: Disponibles para tomar
- **⚠️ Próximos a Vencer**: Cerca del límite SLA

#### Tab: "Mis Tickets"

Muestra todos los tickets asignados a ti.

**Acciones:**
1. Click en un ticket para ver detalles
2. Cambiar estado:
   - **En curso**: Estás trabajando
   - **Pausado**: Esperando algo (no cuenta tiempo SLA)
   - **Resuelto**: Problema solucionado
3. Agregar comentarios/solución
4. Guardar cambios

**⚠️ Importante:**
- Para marcar "Resuelto" DEBES agregar comentario explicando la solución
- No puedes cerrar tickets (solo admin)

#### Tab: "Sin Asignar"

Tickets disponibles para tomar.

**Cómo tomar un ticket:**
1. Buscar ticket adecuado
2. Click en botón "Tomar"
3. El ticket pasa automáticamente a "En curso"
4. Se envía email al solicitante

### Buenas Prácticas

✅ **SÍ Hacer:**
- Tomar tickets según tu especialidad
- Actualizar estado regularmente
- Agregar comentarios detallados
- Marcar "Pausado" si esperas respuesta del usuario
- Resolver tickets lo antes posible

❌ **NO Hacer:**
- Tomar más tickets de los que puedes manejar
- Dejar tickets sin actualizar por días
- Marcar "Resuelto" sin explicar la solución
- Olvidar tickets en "Pausado"

### Desasignar un Ticket

Si no puedes resolver un ticket:
1. Abrir ticket
2. Click en "Desasignar Ticket"
3. Confirmar
4. El ticket vuelve a "Sin Asignar"

---

## 👨‍💼 Para Administradores

### Acceso Completo

Los administradores tienen acceso a 5 módulos:

#### 1. ➕ Crear Ticket
- Mismo wizard que empleados
- Útil para crear tickets en nombre de usuarios

#### 2. 📋 Gestión de Tickets

**Filtros Rápidos:**
- **Todos**: Ver todo
- **🔥 Críticos**: Alta prioridad
- **👤 Sin Asignar**: Necesitan técnico
- **⚡ En Curso**: Siendo trabajados

**Funciones Admin:**
- Ver TODOS los tickets
- Editar cualquier campo
- Cambiar prioridad validada
- Asignar/reasignar técnicos
- Cerrar tickets
- Ver historial completo

**Editar Ticket:**
1. Click en ticket
2. Modificar:
   - Título, descripción
   - Estado, prioridad
   - Categoría, sede
   - Técnico asignado
   - Comentarios
3. Guardar cambios

**Alert de Prioridad:**
Si usuario solicitó urgencia diferente a la validada, aparece alerta amarilla.

#### 3. 📊 Reportes

**Indicadores Generales:**
- Tickets Abiertos
- Tickets Cerrados
- % SLA Cumplido
- Tiempo Promedio de Resolución

**Estado del Servicio:**
- Críticos sin asignar (requieren atención inmediata)
- Próximos a vencer SLA
- Tendencia últimos 7 días

**Rendimiento del Equipo:**
- Tickets por técnico
- Tasa de cierre
- Tiempo promedio
- % SLA cumplido

#### 4. 📈 Analytics

**Selector de Período:**
- Últimos 7/30/60/90 días
- Todo el historial

**Resumen Ejecutivo:**
- Comparación período actual vs anterior
- Indicadores de mejora/empeoramiento

**Comparativa de Técnicos:**
- Total tickets manejados
- Tasa de cierre
- Tiempo promedio de resolución
- SLA vencidos

**Proyección:**
- Estimación de tickets próximo mes

**Patrones:**
- Tickets por día de la semana
- Tickets por hora del día

**Recomendaciones Inteligentes:**
- Técnicos sobrecargados
- Días/horas pico
- Tendencias preocupantes

#### 5. ⚙️ Configuración

**Gestión de Usuarios:**
1. Ver lista de usuarios
2. Agregar nuevo:
   - Email único
   - Contraseña (mín 6 caracteres)
   - Nombre completo
   - Rol: Admin o Auxiliar
   - Estado: Activo/Inactivo
3. Editar usuarios existentes
4. Eliminar usuarios (excepto a sí mismo)

**Configuración de SLA:**
- Establecer horas límite por prioridad
- Crítica: 4h (default)
- Alta: 8h (default)
- Media: 24h (default)
- Baja: 72h (default)

**Autocierre de Tickets:**
- Configurar horas después de "Resuelto"
- Default: 72 horas

**Gestión de Catálogos:**
- Sedes (agregar/eliminar)
- Categorías (agregar/eliminar)
- Lista sincronizada con usuarios técnicos

### Códigos de Color SLA

- 🟢 **Verde (OK)**: Más del 25% tiempo restante
- 🟡 **Amarillo (Warning)**: Menos del 25% tiempo restante
- 🔴 **Rojo (Critical)**: Tiempo vencido
- ⚫ **Gris**: Cerrado o pausado

---

## ❓ Preguntas Frecuentes

**P: ¿Puedo ver el estado de mi ticket?**
R: Los empleados reciben actualizaciones por email. Los técnicos pueden ver todos sus tickets asignados.

**P: ¿Cuánto tarda en asignarse mi ticket?**
R: Depende de la urgencia. Los críticos se asignan inmediatamente, los demás en orden de llegada.

**P: ¿Qué significa "SLA Vencido"?**
R: El ticket superó el tiempo límite definido para su prioridad.

**P: ¿Puedo cancelar un ticket?**
R: Contacta a soporte o crea un nuevo ticket indicando que el anterior ya no es necesario.

**P: No recibo emails**
R: Verifica tu bandeja de spam. Si persiste, contacta a IT.

**P: Olvidé mi contraseña**
R: Contacta al administrador para que la restablezca.

---

## 📞 Soporte

Para problemas con el sistema de tickets:
- Email: soporte@sietefronteras.com.py
- Interno: Departamento de IT

---

**¡Gracias por usar el Sistema de Tickets de Siete Fronteras!** 🎯
