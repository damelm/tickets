import bcrypt from 'bcryptjs';
import pool from '../src/db/pool.js';

// Seed de demo: genera una empresa ficticia completa (usuarios, tickets e historial)
// de forma determinística, para poder correrlo varias veces sin duplicar datos.
// Solo toca los usuarios del dominio de demo; cualquier cuenta real queda intacta.

const DEV_PASSWORD = 'devpass123';
const DEMO_DOMAIN = 'empresa.com';
const RANDOM_SEED = 20260828;
const TICKET_TARGET = 240;
const SHOWCASE_TICKETS_EACH = 6;
const MONTHS_OF_HISTORY = 6;

const DEPARTMENTS = [
  { name: 'Finanzas', acceptsTickets: true, headcount: 26, ticketWeight: 12 },
  { name: 'IT', acceptsTickets: true, headcount: 28, ticketWeight: 55 },
  { name: 'RRHH', acceptsTickets: true, headcount: 22, ticketWeight: 14 },
  { name: 'Compras', acceptsTickets: true, headcount: 20, ticketWeight: 8 },
  { name: 'Legal', acceptsTickets: true, headcount: 10, ticketWeight: 4 },
  { name: 'Marketing', acceptsTickets: true, headcount: 18, ticketWeight: 5 },
  { name: 'Ventas', acceptsTickets: true, headcount: 48, ticketWeight: 6 },
  { name: 'Operaciones', acceptsTickets: true, headcount: 46, ticketWeight: 7 },
  { name: 'Logística', acceptsTickets: true, headcount: 34, ticketWeight: 7 },
  { name: 'Atención al Cliente', acceptsTickets: true, headcount: 42, ticketWeight: 8 },
  { name: 'Administración', acceptsTickets: true, headcount: 30, ticketWeight: 9 },
  { name: 'Auditoría', acceptsTickets: false, headcount: 8, ticketWeight: 0 },
  { name: 'Seguridad', acceptsTickets: true, headcount: 12, ticketWeight: 4 },
  { name: 'Mantenimiento', acceptsTickets: true, headcount: 20, ticketWeight: 8 },
  { name: 'Calidad', acceptsTickets: true, headcount: 16, ticketWeight: 3 },
  { name: 'Comunicaciones', acceptsTickets: false, headcount: 10, ticketWeight: 0 },
  { name: 'Proyectos', acceptsTickets: true, headcount: 14, ticketWeight: 3 },
  { name: 'Dirección General', acceptsTickets: false, headcount: 6, ticketWeight: 0 },
];

// Cuentas fijas y documentadas para poder entrar a la demo con un rol conocido.
const SHOWCASE_USERS = [
  { fullName: 'Andrés López', email: `andres.lopez@${DEMO_DOMAIN}`, role: 'admin', department: 'Dirección General' },
  { fullName: 'Valeria Sosa', email: `valeria.sosa@${DEMO_DOMAIN}`, role: 'admin', department: 'Administración' },
  { fullName: 'Martín Quiroga', email: `martin.quiroga@${DEMO_DOMAIN}`, role: 'admin', department: 'IT' },
  { fullName: 'Sebastián Ruiz', email: `sebastian.ruiz@${DEMO_DOMAIN}`, role: 'agente', department: 'IT' },
  { fullName: 'Laura Fernández', email: `laura.fernandez@${DEMO_DOMAIN}`, role: 'agente', department: 'RRHH' },
  { fullName: 'Diego Torres', email: `diego.torres@${DEMO_DOMAIN}`, role: 'agente', department: 'Compras' },
  { fullName: 'María Gómez', email: `maria.gomez@${DEMO_DOMAIN}`, role: 'empleado', department: 'Finanzas' },
  { fullName: 'Ana López', email: `ana.lopez@${DEMO_DOMAIN}`, role: 'empleado', department: 'Ventas' },
];

const FIRST_NAMES = [
  'Agustín', 'Alejandra', 'Alejo', 'Analía', 'Bruno', 'Camila', 'Carla', 'Carlos', 'Cecilia', 'Cristian',
  'Damián', 'Daniela', 'Emilia', 'Emiliano', 'Ernesto', 'Esteban', 'Facundo', 'Federico', 'Florencia', 'Gabriel',
  'Gastón', 'Gimena', 'Gonzalo', 'Guadalupe', 'Hernán', 'Ignacio', 'Inés', 'Javier', 'Julieta', 'Leandro',
  'Lucía', 'Luciano', 'Magalí', 'Mariano', 'Marina', 'Matías', 'Micaela', 'Nadia', 'Nicolás', 'Norberto',
  'Pablo', 'Paula', 'Rocío', 'Rodrigo', 'Romina', 'Santiago', 'Silvina', 'Tomás', 'Valentina', 'Verónica',
];

const LAST_NAMES = [
  'Acosta', 'Aguirre', 'Álvarez', 'Arias', 'Ayala', 'Barrios', 'Benítez', 'Blanco', 'Bustos', 'Cabrera',
  'Cáceres', 'Cardozo', 'Carrizo', 'Castro', 'Coronel', 'Correa', 'Delgado', 'Domínguez', 'Escobar', 'Farías',
  'Ferreyra', 'Figueroa', 'Franco', 'Gallardo', 'Giménez', 'Godoy', 'Herrera', 'Ibarra', 'Juárez', 'Ledesma',
  'Leiva', 'Luna', 'Maidana', 'Maldonado', 'Medina', 'Méndez', 'Molina', 'Montenegro', 'Moyano', 'Nieva',
  'Ojeda', 'Olivera', 'Orellana', 'Paz', 'Peralta', 'Pereyra', 'Ponce', 'Quintana', 'Ramírez', 'Rivero',
  'Roldán', 'Romero', 'Salazar', 'Sandoval', 'Suárez', 'Tapia', 'Toledo', 'Valdez', 'Vega', 'Villalba',
  'Zalazar', 'Zárate', 'Cufré', 'Rearte',
];

const TOKENS = {
  sistema: ['el ERP', 'la intranet', 'el CRM', 'el portal de proveedores', 'el sistema de liquidación', 'la casilla corporativa', 'el gestor documental'],
  sucursal: ['la sucursal Córdoba', 'la sucursal Rosario', 'la sede central', 'el depósito de Avellaneda', 'la sucursal Mendoza', 'la planta de Pilar'],
  mes: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto'],
  proveedor: ['Distribuidora del Sur', 'Insumos Andinos SRL', 'Tecnopartes SA', 'Grupo Delta', 'Papelera Litoral'],
  equipo: ['la notebook Lenovo', 'la impresora del piso 3', 'el monitor del box 12', 'el teléfono IP del sector', 'la terminal de caja 2'],
  area: ['Ventas', 'Operaciones', 'Logística', 'Atención al Cliente', 'Administración'],
};

const TICKET_TEMPLATES = {
  IT: [
    ['No puedo conectarme a la VPN', 'Desde el lunes la VPN corta a los pocos minutos y pierdo la sesión de {sistema}. Trabajo remoto tres días por semana y así no puedo avanzar.'],
    ['Alta de usuario para ingresante', 'Ingresa una persona nueva la semana que viene. Necesito usuario de red, casilla y acceso a {sistema} con permisos de lectura.'],
    ['Baja de accesos por desvinculación', 'Se desvinculó una persona del sector. Pido dar de baja todos los accesos y redirigir su casilla al responsable del área.'],
    ['{equipo} no enciende', 'Al presionar el botón de encendido no da señal de vida. Ya probé con otro cable de alimentación y otro tomacorriente.'],
    ['Error 500 al generar reportes en {sistema}', 'Cuando filtro por rango de fechas mayor a un mes la pantalla devuelve error. Con rangos cortos funciona bien.'],
    ['Solicitud de licencia de software', 'Necesito la licencia de la suite de diseño para el equipo nuevo. Ya está aprobado por mi jefatura.'],
    ['Casilla de correo llena', 'La casilla llegó al límite de espacio y estoy rebotando correos de clientes. Pido ampliación de cuota.'],
    ['Wifi inestable en {sucursal}', 'La red inalámbrica se cae varias veces por día en el sector operativo. Afecta a todo el turno tarde.'],
    ['Reseteo de contraseña bloqueada', 'Ingresé mal la clave tres veces y el usuario quedó bloqueado. No puedo entrar a ningún sistema.'],
    ['Permisos de carpeta compartida', 'Necesito acceso de escritura a la carpeta compartida del área para poder subir los cierres mensuales.'],
    ['Migración de datos a la notebook nueva', 'Me entregaron el equipo de reemplazo pero faltan los archivos locales y los certificados de firma.'],
    ['Backup de servidor sin completar', 'El backup nocturno viene fallando hace cuatro días según el aviso automático. Pido revisión.'],
  ],
  RRHH: [
    ['Solicitud de vacaciones', 'Quiero tomar dos semanas a partir del mes que viene. Mi jefatura ya está avisada, necesito la carga formal.'],
    ['Recibo de sueldo con error', 'En el recibo de {mes} no figura el pago de horas extra del cierre. Adjunto el detalle de las horas cargadas.'],
    ['Certificado de trabajo para trámite bancario', 'Me piden certificado con antigüedad y remuneración para un crédito. Lo necesito esta semana.'],
    ['Carga de licencia médica', 'Presenté el certificado médico por tres días en recepción y todavía no figura cargado en {sistema}.'],
    ['Consulta por adelanto de haberes', 'Quisiera saber si corresponde adelanto de haberes y cuál es el procedimiento para pedirlo.'],
    ['Actualización de datos personales', 'Cambié de domicilio y de teléfono. Necesito actualizar el legajo y la cobertura médica.'],
    ['Alta de familiar en obra social', 'Nació mi hija y necesito incorporarla como beneficiaria. Consulto qué documentación tengo que presentar.'],
    ['Búsqueda de perfil para {area}', 'El área necesita cubrir una vacante. Pido iniciar la búsqueda con el perfil que adjunto en la descripción.'],
    ['Consulta sobre licencia por estudio', 'Estoy cursando una carrera y quiero saber cuántos días de examen me corresponden por convenio.'],
    ['Capacitación obligatoria pendiente', 'Figuro como pendiente en la capacitación anual pero la hice en {mes}. Pido corrección del registro.'],
  ],
  Finanzas: [
    ['Reembolso de viáticos pendiente', 'Cargué la rendición de un viaje a {sucursal} hace tres semanas y todavía no se acreditó.'],
    ['Factura de {proveedor} sin registrar', 'El proveedor reclama el pago pero la factura no aparece cargada en {sistema}. Adjunto número y fecha.'],
    ['Solicitud de anticipo para viaje', 'Viajo a {sucursal} la semana próxima y necesito anticipo de gastos de traslado y alojamiento.'],
    ['Diferencia en la conciliación bancaria', 'Aparece una diferencia en la conciliación de {mes} que no logramos identificar. Pido revisión conjunta.'],
    ['Alta de nuevo proveedor', 'Necesitamos dar de alta a {proveedor} en el sistema para poder emitir la orden de compra.'],
    ['Consulta sobre retenciones de un pago', 'Un cliente reclama que le retuvimos de más en el último pago. Pido revisar el cálculo.'],
    ['Nota de crédito no aplicada', 'Emitimos una nota de crédito el mes pasado y sigue figurando la deuda en la cuenta corriente del cliente.'],
    ['Cierre contable de {mes}', 'Necesitamos los ajustes del área para poder cerrar el mes. Falta el detalle de amortizaciones.'],
    ['Presupuesto anual del área', 'Pido el formulario y el instructivo para cargar el presupuesto del próximo ejercicio.'],
    ['Rendición de caja chica', 'Se agotó la caja chica del sector y quedan comprobantes sin rendir. Pido reposición.'],
  ],
  Compras: [
    ['Pedido de insumos de oficina', 'Se agotaron resmas, toner y artículos de librería en {sucursal}. Adjunto listado con cantidades.'],
    ['Cotización para equipamiento nuevo', 'Necesitamos tres cotizaciones para reemplazar el equipamiento del sector. Ya está el ok de la jefatura.'],
    ['Demora en la entrega de {proveedor}', 'La orden de compra tiene tres semanas de atraso y el área operativa está parada.'],
    ['Alta de artículo en el catálogo', 'El artículo que usamos habitualmente no figura en el catálogo de {sistema} y no puedo generar el pedido.'],
    ['Devolución de mercadería con falla', 'Recibimos mercadería con defectos de fábrica. Pido gestionar la devolución y el reemplazo.'],
    ['Renovación de contrato con proveedor', 'El contrato de servicio vence el mes que viene. Consulto si se renueva o se sale a licitar.'],
    ['Comparativa de precios de insumos', 'Pido una comparativa de precios de los últimos seis meses para justificar el aumento del presupuesto.'],
    ['Orden de compra rechazada', 'La orden que cargué figura rechazada sin motivo visible en {sistema}. Necesito saber qué falta.'],
  ],
  Legal: [
    ['Revisión de contrato con {proveedor}', 'Adjunto el borrador de contrato para revisión antes de la firma. Necesitamos devolución esta semana.'],
    ['Consulta por cláusula de confidencialidad', 'Un cliente pide modificar la cláusula de confidencialidad del acuerdo marco. Consulto si es aceptable.'],
    ['Carta documento recibida', 'Llegó una carta documento a {sucursal} relacionada con un reclamo comercial. Pido intervención.'],
    ['Actualización de términos y condiciones', 'Cambió la modalidad de contratación y hay que actualizar los términos publicados en el sitio.'],
    ['Poder para trámite ante organismo', 'Necesitamos un poder firmado para gestionar un trámite ante el organismo de control.'],
    ['Revisión de convenio de pasantías', 'La universidad envió el convenio de pasantías con cambios. Pido revisión antes de devolverlo.'],
  ],
  Marketing: [
    ['Material gráfico para lanzamiento', 'Necesitamos piezas para el lanzamiento del mes que viene: gráfica de vidriera, posteos y mailing.'],
    ['Actualización de contenidos del sitio', 'La sección de productos quedó desactualizada tras el cambio de catálogo. Pido corrección.'],
    ['Merchandising para evento en {sucursal}', 'Participamos de una feria y necesitamos kit de merchandising y roll-up institucional.'],
    ['Reporte de campaña de {mes}', 'Pido el reporte de resultados de la campaña para presentarlo en la reunión de gerencia.'],
    ['Fotos de producto para catálogo', 'Los productos nuevos no tienen fotos y no podemos publicarlos en {sistema}.'],
    ['Aprobación de pieza para redes', 'Adjunto la pieza para revisión de marca antes de publicarla en las redes de la empresa.'],
  ],
  Ventas: [
    ['Cliente sin ficha en el CRM', 'El cliente ya operó dos veces pero no figura cargado en {sistema}. No puedo asociarle la oportunidad.'],
    ['Solicitud de descuento especial', 'Un cliente mayorista pide condición especial por volumen. Necesito autorización comercial.'],
    ['Error en la lista de precios', 'La lista de precios vigente no coincide con la que figura en {sistema}. Pido revisión urgente.'],
    ['Reclamo por comisión no liquidada', 'No se liquidó la comisión de dos operaciones cerradas en {mes}. Adjunto los números de operación.'],
    ['Alta de vendedor en {sucursal}', 'Se incorpora un vendedor nuevo. Necesita usuario, cartera asignada y acceso al CRM.'],
    ['Consulta por stock comprometido', 'El sistema muestra stock disponible que en realidad está comprometido en otro pedido.'],
  ],
  Operaciones: [
    ['Retraso en el circuito de aprobación', 'Los pedidos quedan trabados más de una semana en el circuito de aprobación de {sistema}.'],
    ['Ajuste de turnos en {sucursal}', 'Necesitamos reorganizar los turnos del sector por la baja de dos personas.'],
    ['Procedimiento operativo desactualizado', 'El procedimiento publicado no refleja el circuito real desde el cambio de {mes}.'],
    ['Falta de insumos en línea de trabajo', 'El sector quedó sin insumos críticos y tuvimos que frenar la operación media jornada.'],
    ['Indicadores de productividad sin datos', 'El tablero de indicadores no muestra datos desde la semana pasada.'],
    ['Coordinación de parada programada', 'Pido coordinar la parada programada de {sucursal} para la próxima quincena.'],
  ],
  Logística: [
    ['Envío extraviado', 'Un envío a cliente figura despachado hace cinco días y el cliente no lo recibió. Adjunto número de guía.'],
    ['Diferencia de stock en {sucursal}', 'El conteo físico no coincide con el stock del sistema en tres artículos. Pido auditoría de movimientos.'],
    ['Demora del transportista', 'El transportista viene acumulando demoras en la ruta al interior. Pedimos revisar el acuerdo de servicio.'],
    ['Pedido de retiro urgente', 'Necesitamos coordinar un retiro urgente en {sucursal} para entregar el lunes temprano.'],
    ['Embalaje dañado en recepción', 'Llegó mercadería con embalaje dañado. Adjunto fotos para gestionar el reclamo con {proveedor}.'],
    ['Alta de nueva dirección de entrega', 'Un cliente cambió de depósito y hay que actualizar la dirección de entrega en {sistema}.'],
  ],
  'Atención al Cliente': [
    ['Reclamo reiterado de cliente', 'Un cliente reclama por tercera vez el mismo problema de facturación. Escalo el caso.'],
    ['Demora en tiempos de respuesta', 'Los tiempos de respuesta del canal telefónico se duplicaron esta semana. Pido refuerzo.'],
    ['Guion de atención desactualizado', 'El guion de atención no contempla la nueva modalidad de envío y genera confusión.'],
    ['Alta de canal de WhatsApp', 'Queremos habilitar atención por WhatsApp para el segmento minorista. Consulto factibilidad.'],
    ['Cliente pide baja de servicio', 'Un cliente solicitó la baja y necesito el procedimiento formal y el plazo de preaviso.'],
    ['Encuesta de satisfacción sin respuestas', 'La encuesta post atención dejó de enviarse a los clientes desde {mes}.'],
  ],
  Administración: [
    ['Solicitud de credencial de acceso', 'Necesito credencial de ingreso para una persona que se incorpora a {area}.'],
    ['Reserva de sala de reuniones', 'Necesito reservar la sala grande para una reunión con clientes de todo el día.'],
    ['Reposición de artículos de limpieza', 'Se agotaron los insumos de limpieza en {sucursal}. Pido reposición semanal fija.'],
    ['Archivo de documentación física', 'Necesitamos espacio de archivo para la documentación de {mes} que ya no entra en el sector.'],
    ['Trámite de seguro de flota', 'Vence la póliza de la flota. Pido iniciar la renovación con tiempo.'],
    ['Actualización del organigrama', 'El organigrama publicado quedó desactualizado tras la reestructuración del área.'],
  ],
  Seguridad: [
    ['Incidente en el ingreso de {sucursal}', 'Se registró un ingreso sin credencial en el turno noche. Pido revisión de cámaras.'],
    ['Cámara fuera de servicio', 'La cámara del sector de carga no está grabando desde el fin de semana.'],
    ['Intento de phishing por correo', 'Recibimos correos que simulan ser de {sistema} pidiendo credenciales. Pido alerta general.'],
    ['Solicitud de ronda adicional', 'Pedimos una ronda adicional en el turno noche mientras dure el operativo de inventario.'],
    ['Control de acceso de visitas', 'Necesitamos formalizar el registro de visitas de proveedores en {sucursal}.'],
  ],
  Mantenimiento: [
    ['Aire acondicionado sin funcionar', 'El equipo de aire del piso 2 no enfría desde el lunes y el sector es inviable a la tarde.'],
    ['Filtración de agua en {sucursal}', 'Hay una filtración en el techo del depósito que moja mercadería. Es urgente.'],
    ['Luminaria quemada en el sector', 'Tres luminarias del sector operativo están quemadas y quedó una zona a oscuras.'],
    ['Puerta de emergencia trabada', 'La puerta de emergencia del sector no abre correctamente. Es un riesgo para la evacuación.'],
    ['Mantenimiento preventivo de ascensor', 'Corresponde el mantenimiento preventivo del ascensor según el cronograma.'],
    ['Silla de trabajo rota', 'La silla de mi puesto tiene el pistón roto y no se puede regular la altura.'],
  ],
  Calidad: [
    ['No conformidad detectada en {sucursal}', 'Se detectó una no conformidad en el proceso de control final. Pido apertura del caso.'],
    ['Actualización de instructivo de trabajo', 'El instructivo vigente no contempla el cambio de proveedor de insumos.'],
    ['Auditoría interna programada', 'Pido coordinar la auditoría interna del sector antes del cierre del trimestre.'],
    ['Reclamo de cliente por producto', 'Un cliente devolvió producto fuera de especificación. Pido análisis de causa raíz.'],
    ['Calibración de instrumentos vencida', 'Dos instrumentos del sector tienen la calibración vencida desde {mes}.'],
  ],
  Proyectos: [
    ['Retraso en hito del proyecto', 'El hito de integración se corrió tres semanas y afecta la fecha de salida a producción.'],
    ['Alta de recurso en el proyecto', 'Necesitamos incorporar una persona de {area} al equipo del proyecto.'],
    ['Cambio de alcance solicitado', 'El sponsor pidió sumar un módulo nuevo. Pido evaluar impacto en plazo y costo.'],
    ['Reunión de seguimiento sin acta', 'Falta el acta de la última reunión de seguimiento y hay compromisos sin registrar.'],
    ['Acceso al tablero del proyecto', 'El equipo nuevo no tiene acceso al tablero del proyecto en {sistema}.'],
  ],
};

const OPENING_COMMENTS = [
  'Adjunto el detalle por si hace falta más información.',
  'Quedo a disposición para ampliar lo que necesiten.',
  'Ya lo hablé con mi jefatura y está al tanto del pedido.',
  'Es bastante urgente porque frena el trabajo del sector.',
  'Probé lo que me indicaron por teléfono y el problema sigue igual.',
  'Si necesitan que pase por el sector, avísenme y coordino.',
];

const AGENT_COMMENTS = [
  'Tomo el caso, lo estoy revisando.',
  'Necesito un dato más para avanzar: te escribo por interno.',
  'Ya lo escalé al responsable del área, en cuanto tenga novedades aviso.',
  'Estamos esperando la respuesta del proveedor para poder cerrarlo.',
  'Reproduje el problema, coincide con lo reportado.',
  'Quedó pendiente de aprobación de la jefatura correspondiente.',
  'Lo dejo en revisión para validar con el solicitante antes de cerrar.',
];

const DONE_COMMENTS = [
  'Resuelto. Cualquier cosa reabrimos el caso.',
  'Ya está aplicado el cambio, probá y confirmá que quedó bien.',
  'Se resolvió con el proveedor. Cierro el ticket.',
  'Confirmado por el solicitante, lo doy por cerrado.',
  'Se aplicó la solución definitiva y quedó documentada en el procedimiento.',
];

const STATUS_FLOW = ['backlog', 'todo', 'in_progress', 'review', 'done'];
const STATUS_WEIGHTS = [['backlog', 12], ['todo', 15], ['in_progress', 17], ['review', 12], ['done', 44]];
const PRIORITY_WEIGHTS = [['baja', 22], ['media', 40], ['alta', 26], ['urgente', 12]];

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(RANDOM_SEED);
const pick = (items) => items[Math.floor(random() * items.length)];
const randInt = (min, max) => min + Math.floor(random() * (max - min + 1));

function pickWeighted(entries) {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let threshold = random() * total;
  for (const [value, weight] of entries) {
    threshold -= weight;
    if (threshold <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

function slug(text) {
  return text
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function fillTokens(text) {
  return text.replace(/\{(\w+)\}/g, (match, token) => (TOKENS[token] ? pick(TOKENS[token]) : match));
}

function buildRoster() {
  const usedEmails = new Set();
  const users = [];

  const showcaseByDepartment = new Map();
  for (const user of SHOWCASE_USERS) {
    if (!showcaseByDepartment.has(user.department)) showcaseByDepartment.set(user.department, []);
    showcaseByDepartment.get(user.department).push(user);
    usedEmails.add(user.email);
  }

  for (const dept of DEPARTMENTS) {
    const showcase = showcaseByDepartment.get(dept.name) ?? [];
    const roles = [];

    const agentTarget = dept.acceptsTickets ? (dept.headcount >= 20 ? randInt(3, 4) : randInt(2, 3)) : 1;
    const adminTarget = showcase.filter((u) => u.role === 'admin').length;
    for (let i = 0; i < adminTarget; i += 1) roles.push('admin');
    for (let i = 0; i < agentTarget; i += 1) roles.push('agente');
    while (roles.length < dept.headcount) roles.push('empleado');

    for (const user of showcase) {
      const index = roles.indexOf(user.role);
      if (index !== -1) roles.splice(index, 1);
      users.push({ ...user, isActive: true });
    }

    for (const role of roles) {
      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      let fullName = `${firstName} ${lastName}`;
      let email = `${slug(firstName)}.${slug(lastName)}@${DEMO_DOMAIN}`;
      if (usedEmails.has(email)) {
        const secondLastName = pick(LAST_NAMES);
        fullName = `${firstName} ${lastName} ${secondLastName}`;
        email = `${slug(firstName)}.${slug(lastName)}.${slug(secondLastName)}@${DEMO_DOMAIN}`;
      }
      let suffix = 2;
      while (usedEmails.has(email)) {
        email = `${slug(firstName)}.${slug(lastName)}${suffix}@${DEMO_DOMAIN}`;
        suffix += 1;
      }
      usedEmails.add(email);

      users.push({
        fullName,
        email,
        role,
        department: dept.name,
        isActive: role !== 'empleado' || random() > 0.08,
      });
    }
  }

  return users;
}

function buildTicketPlan(users, now) {
  const agentsByDepartment = new Map();
  for (const user of users) {
    if (user.role !== 'agente') continue;
    if (!agentsByDepartment.has(user.department)) agentsByDepartment.set(user.department, []);
    agentsByDepartment.get(user.department).push(user);
  }
  const requesters = users.filter((u) => u.role === 'empleado' && u.isActive);
  // Las cuentas de empleado documentadas para la demo tienen tickets propios garantizados:
  // con reparto puramente al azar entre 359 empleados quedaban vacías, y entrar como
  // empleado a una lista vacía arruina el recorrido.
  const showcaseRequesters = requesters.filter((u) => SHOWCASE_USERS.some((s) => s.email === u.email));
  const showcaseSlots = showcaseRequesters.length * SHOWCASE_TICKETS_EACH;
  const departmentWeights = DEPARTMENTS.filter((d) => d.acceptsTickets).map((d) => [d.name, d.ticketWeight]);
  const historyStart = now - MONTHS_OF_HISTORY * 30 * DAY;

  const tickets = [];
  for (let i = 0; i < TICKET_TARGET; i += 1) {
    const departmentName = pickWeighted(departmentWeights);
    const [subjectTemplate, descriptionTemplate] = pick(TICKET_TEMPLATES[departmentName]);
    const status = pickWeighted(STATUS_WEIGHTS);
    const priority = pickWeighted(PRIORITY_WEIGHTS);
    const createdAt = historyStart + Math.floor(random() * (now - historyStart - 2 * DAY));
    const requester = i < showcaseSlots ? showcaseRequesters[i % showcaseRequesters.length] : pick(requesters);
    const agents = agentsByDepartment.get(departmentName) ?? [];
    const needsAgent = status === 'backlog' ? random() < 0.1 : status === 'todo' ? random() < 0.5 : true;
    const agent = needsAgent && agents.length ? pick(agents) : null;

    const ticket = {
      departmentName,
      subject: fillTokens(subjectTemplate),
      description: fillTokens(descriptionTemplate),
      priority,
      status,
      createdByEmail: requester.email,
      assignedToEmail: agent?.email ?? null,
      createdAt,
    };
    ticket.events = buildEvents(ticket, now);
    ticket.updatedAt = ticket.events.length ? ticket.events[ticket.events.length - 1].createdAt : createdAt;
    tickets.push(ticket);
  }

  return tickets;
}

function buildEvents(ticket, now) {
  const finalIndex = STATUS_FLOW.indexOf(ticket.status);
  const steps = [];
  // La mayoría de los pasos se resuelven en el día; una minoría se estira, para que el
  // promedio de resolución quede por encima de la mediana como en un helpdesk real.
  for (let i = 1; i <= finalIndex; i += 1) steps.push((random() < 0.7 ? randInt(1, 16) : randInt(16, 120)) * HOUR);
  const openingOffset = randInt(5, 240) * 60 * 1000;
  const totalSpan = openingOffset + steps.reduce((sum, step) => sum + step, 0);
  const available = now - ticket.createdAt;
  const scale = totalSpan > available ? (available * 0.9) / totalSpan : 1;

  const events = [];
  let cursor = ticket.createdAt + Math.round(openingOffset * scale);
  events.push({
    authorEmail: ticket.createdByEmail,
    eventType: 'comment',
    commentBody: pick(OPENING_COMMENTS),
    fromValue: null,
    toValue: null,
    createdAt: cursor,
  });

  const responderEmail = ticket.assignedToEmail ?? ticket.createdByEmail;

  if (ticket.assignedToEmail && finalIndex >= 1) {
    events.push({
      authorEmail: responderEmail,
      eventType: 'assignment_change',
      commentBody: null,
      fromValue: null,
      toValue: ticket.assignedToEmail,
      createdAt: cursor + 60 * 1000,
    });
  }

  for (let i = 1; i <= finalIndex; i += 1) {
    cursor += Math.round(steps[i - 1] * scale);
    events.push({
      authorEmail: responderEmail,
      eventType: 'status_change',
      commentBody: null,
      fromValue: STATUS_FLOW[i - 1],
      toValue: STATUS_FLOW[i],
      createdAt: cursor,
    });
    if (STATUS_FLOW[i] === 'in_progress' || (STATUS_FLOW[i] === 'review' && random() < 0.6)) {
      events.push({
        authorEmail: responderEmail,
        eventType: 'comment',
        commentBody: pick(AGENT_COMMENTS),
        fromValue: null,
        toValue: null,
        createdAt: cursor + 30 * 60 * 1000,
      });
    }
  }

  if (ticket.status === 'done') {
    events.push({
      authorEmail: responderEmail,
      eventType: 'comment',
      commentBody: pick(DONE_COMMENTS),
      fromValue: null,
      toValue: null,
      createdAt: cursor + 20 * 60 * 1000,
    });
  }

  if (random() < 0.12) {
    const otherPriorities = PRIORITY_WEIGHTS.map(([p]) => p).filter((p) => p !== ticket.priority);
    events.push({
      authorEmail: responderEmail,
      eventType: 'priority_change',
      commentBody: null,
      fromValue: pick(otherPriorities),
      toValue: ticket.priority,
      createdAt: ticket.createdAt + Math.round((cursor - ticket.createdAt) * 0.4) + HOUR,
    });
  }

  return events.sort((a, b) => a.createdAt - b.createdAt).filter((e) => e.createdAt <= now);
}

async function upsertDepartments(client) {
  const byName = new Map();
  for (const dept of DEPARTMENTS) {
    const { rows } = await client.query(
      `INSERT INTO departments (name, accepts_tickets)
       VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET accepts_tickets = EXCLUDED.accepts_tickets
       RETURNING id, name`,
      [dept.name, dept.acceptsTickets]
    );
    byName.set(rows[0].name, rows[0].id);
  }
  return byName;
}

async function upsertUsers(client, users, departmentIds, passwordHash) {
  const idsByEmail = new Map();
  const chunkSize = 100;
  for (let start = 0; start < users.length; start += chunkSize) {
    const chunk = users.slice(start, start + chunkSize);
    const params = [];
    const values = chunk.map((user) => {
      params.push(user.fullName, user.email, passwordHash, user.role, departmentIds.get(user.department), user.isActive);
      const base = params.length - 6;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`;
    });
    // password_hash queda fuera del DO UPDATE a propósito: re-correr el seed no debe pisar claves.
    const { rows } = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role, department_id, is_active)
       VALUES ${values.join(', ')}
       ON CONFLICT (email) DO UPDATE
         SET full_name = EXCLUDED.full_name,
             role = EXCLUDED.role,
             department_id = EXCLUDED.department_id,
             is_active = EXCLUDED.is_active,
             updated_at = now()
       RETURNING id, email`,
      params
    );
    for (const row of rows) idsByEmail.set(row.email, row.id);
  }
  return idsByEmail;
}

async function insertTickets(client, tickets, departmentIds, userIds) {
  const ids = [];
  const chunkSize = 100;
  for (let start = 0; start < tickets.length; start += chunkSize) {
    const chunk = tickets.slice(start, start + chunkSize);
    const params = [];
    const values = chunk.map((ticket) => {
      params.push(
        departmentIds.get(ticket.departmentName),
        ticket.subject,
        ticket.description,
        ticket.priority,
        ticket.status,
        userIds.get(ticket.createdByEmail),
        ticket.assignedToEmail ? userIds.get(ticket.assignedToEmail) : null,
        new Date(ticket.createdAt),
        new Date(ticket.updatedAt)
      );
      const base = params.length - 9;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`;
    });
    const { rows } = await client.query(
      `INSERT INTO tickets (department_id, subject, description, priority, status, created_by, assigned_to, created_at, updated_at)
       VALUES ${values.join(', ')} RETURNING id`,
      params
    );
    ids.push(...rows.map((r) => r.id));
  }
  return ids;
}

async function insertEvents(client, tickets, ticketIds, userIds) {
  const flat = [];
  tickets.forEach((ticket, index) => {
    for (const event of ticket.events) {
      flat.push({ ticketId: ticketIds[index], ...event });
    }
  });

  const chunkSize = 500;
  for (let start = 0; start < flat.length; start += chunkSize) {
    const chunk = flat.slice(start, start + chunkSize);
    const params = [];
    const values = chunk.map((event) => {
      const toValue = event.eventType === 'assignment_change' ? String(userIds.get(event.toValue)) : event.toValue;
      params.push(
        event.ticketId,
        userIds.get(event.authorEmail),
        event.eventType,
        event.commentBody,
        event.fromValue,
        toValue,
        new Date(event.createdAt)
      );
      const base = params.length - 7;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`;
    });
    await client.query(
      `INSERT INTO ticket_events (ticket_id, author_id, event_type, comment_body, from_value, to_value, created_at)
       VALUES ${values.join(', ')}`,
      params
    );
  }
  return flat.length;
}

async function run() {
  const now = Date.now();
  const roster = buildRoster();
  const tickets = buildTicketPlan(roster, now);
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const departmentIds = await upsertDepartments(client);
    const userIds = await upsertUsers(client, roster, departmentIds, passwordHash);

    // Solo se borran los tickets creados por el set de demo: cualquier ticket de una
    // cuenta real sobrevive. ticket_events cae por el ON DELETE CASCADE.
    const demoUserIds = [...userIds.values()];
    const { rowCount: removed } = await client.query('DELETE FROM tickets WHERE created_by = ANY($1)', [demoUserIds]);

    const ticketIds = await insertTickets(client, tickets, departmentIds, userIds);
    const eventCount = await insertEvents(client, tickets, ticketIds, userIds);

    await client.query('COMMIT');

    const byStatus = tickets.reduce((acc, t) => ({ ...acc, [t.status]: (acc[t.status] ?? 0) + 1 }), {});
    console.log(`departamentos: ${DEPARTMENTS.length} (${DEPARTMENTS.filter((d) => !d.acceptsTickets).length} no reciben tickets)`);
    console.log(`usuarios demo: ${roster.length} (${roster.filter((u) => !u.isActive).length} inactivos)`);
    console.log(`tickets: ${ticketIds.length} nuevos, ${removed} de demo reemplazados`);
    console.log(`  por estado: ${Object.entries(byStatus).map(([k, v]) => `${k}=${v}`).join(' ')}`);
    console.log(`eventos: ${eventCount}`);
    console.log('seed completo');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
