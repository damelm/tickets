import nodemailer from 'nodemailer';
import db from '../database.js';

let transporter = null;

function initTransporter() {
  if (transporter) return transporter;

  const emailEnabled = db.prepare('SELECT value FROM configuracion WHERE key = ?')
    .get('email_enabled')?.value === 'true';

  if (!emailEnabled || !process.env.EMAIL_HOST) {
    console.log('⚠️  Sistema de email deshabilitado o no configurado');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    console.log('✅ Sistema de email inicializado');
    return transporter;
  } catch (error) {
    console.error('❌ Error al inicializar email:', error.message);
    return null;
  }
}

function getEmailTemplate(type, data) {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    line-height: 1.6;
  `;

  const containerStyle = `
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f8fafc;
  `;

  const cardStyle = `
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  `;

  const headerStyle = `
    background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%);
    color: white;
    padding: 20px;
    border-radius: 8px 8px 0 0;
    text-align: center;
  `;

  const badgeStyle = `
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    margin: 5px 0;
  `;

  const buttonStyle = `
    display: inline-block;
    padding: 12px 24px;
    background: #0f766e;
    color: white !important;
    text-decoration: none;
    border-radius: 6px;
    margin: 20px 0;
  `;

  const templates = {
    TICKET_CREADO: `
      <div style="${containerStyle}">
        <div style="${cardStyle}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">🎫 Ticket Creado - Siete Fronteras</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hola <strong>${data.solicitante}</strong>,</p>
            <p>Tu ticket de soporte ha sido creado exitosamente.</p>

            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Ticket #${data.id}</strong></p>
              <p style="margin: 5px 0;"><strong>Título:</strong> ${data.titulo}</p>
              <p style="margin: 5px 0;"><strong>Prioridad:</strong>
                <span style="${badgeStyle} background: ${getPriorityColor(data.prioridad_usuario)};">
                  ${data.prioridad_usuario}
                </span>
              </p>
              <p style="margin: 5px 0;"><strong>Estado:</strong> ${data.estado}</p>
              <p style="margin: 5px 0;"><strong>Fecha:</strong> ${new Date(data.fecha_creacion).toLocaleString('es-PY')}</p>
            </div>

            <p>Recibirás notificaciones por email sobre el progreso de tu ticket.</p>
            <p>Nuestro equipo de soporte técnico se pondrá en contacto contigo pronto.</p>

            <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
              Gracias por tu paciencia.<br>
              <strong>Equipo de Soporte - Siete Fronteras</strong>
            </p>
          </div>
        </div>
      </div>
    `,

    TICKET_ASIGNADO: `
      <div style="${containerStyle}">
        <div style="${cardStyle}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">👤 Ticket Asignado - Siete Fronteras</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hola <strong>${data.solicitante}</strong>,</p>
            <p>Tu ticket ha sido asignado a un técnico de soporte.</p>

            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Ticket #${data.id}</strong></p>
              <p style="margin: 5px 0;"><strong>Título:</strong> ${data.titulo}</p>
              <p style="margin: 5px 0;"><strong>Técnico asignado:</strong> ${data.asignado}</p>
              <p style="margin: 5px 0;"><strong>Estado:</strong> En curso</p>
            </div>

            <p>El técnico está trabajando en tu solicitud y te contactará si necesita más información.</p>

            <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
              <strong>Equipo de Soporte - Siete Fronteras</strong>
            </p>
          </div>
        </div>
      </div>
    `,

    CAMBIO_ESTADO: `
      <div style="${containerStyle}">
        <div style="${cardStyle}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">🔄 Actualización de Ticket - Siete Fronteras</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hola <strong>${data.solicitante}</strong>,</p>
            <p>El estado de tu ticket ha cambiado.</p>

            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Ticket #${data.id}</strong></p>
              <p style="margin: 5px 0;"><strong>Título:</strong> ${data.titulo}</p>
              <p style="margin: 5px 0;">
                <strong>Estado anterior:</strong> ${data.estadoAnterior}
                <br>
                <strong>Nuevo estado:</strong> <span style="${badgeStyle} background: ${getStatusColor(data.estado)};">${data.estado}</span>
              </p>
            </div>

            ${data.comentarios ? `<p><strong>Comentarios:</strong><br>${data.comentarios}</p>` : ''}

            <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
              <strong>Equipo de Soporte - Siete Fronteras</strong>
            </p>
          </div>
        </div>
      </div>
    `,

    TICKET_RESUELTO: `
      <div style="${containerStyle}">
        <div style="${cardStyle}">
          <div style="${headerStyle}">
            <h2 style="margin: 0;">✅ Ticket Resuelto - Siete Fronteras</h2>
          </div>
          <div style="padding: 20px;">
            <p>Hola <strong>${data.solicitante}</strong>,</p>
            <p>¡Buenas noticias! Tu ticket ha sido resuelto.</p>

            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Ticket #${data.id}</strong></p>
              <p style="margin: 5px 0;"><strong>Título:</strong> ${data.titulo}</p>
              <p style="margin: 5px 0;"><strong>Técnico:</strong> ${data.asignado}</p>
              <p style="margin: 5px 0;"><strong>Estado:</strong> <span style="${badgeStyle} background: #059669; color: white;">Resuelto</span></p>
            </div>

            ${data.comentarios ? `
              <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Solución aplicada:</strong></p>
                <p style="margin: 10px 0 0 0;">${data.comentarios}</p>
              </div>
            ` : ''}

            <p style="background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #d97706;">
              ℹ️ Este ticket se cerrará automáticamente en 72 horas.
            </p>

            <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
              Si tienes alguna pregunta adicional, no dudes en crear un nuevo ticket.<br>
              <strong>Equipo de Soporte - Siete Fronteras</strong>
            </p>
          </div>
        </div>
      </div>
    `
  };

  return templates[type] || '';
}

function getPriorityColor(priority) {
  const colors = {
    'Baja': '#64748b',
    'Media': '#0891b2',
    'Alta': '#d97706',
    'Crítica': '#dc2626'
  };
  return colors[priority] || '#64748b';
}

function getStatusColor(status) {
  const colors = {
    'Nuevo': '#3b82f6',
    'En curso': '#0891b2',
    'Pausado': '#f59e0b',
    'Resuelto': '#059669',
    'Cerrado': '#6b7280'
  };
  return colors[status] || '#64748b';
}

export async function sendEmail(to, subject, type, data) {
  const smtp = initTransporter();

  if (!smtp) {
    console.log('⚠️  Email no enviado (sistema deshabilitado):', subject);
    return false;
  }

  try {
    const html = getEmailTemplate(type, data);

    await smtp.sendMail({
      from: `"Soporte Técnico - Siete Fronteras" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log(`✅ Email enviado: ${subject} → ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
    return false;
  }
}

export const EmailTypes = {
  TICKET_CREADO: 'TICKET_CREADO',
  TICKET_ASIGNADO: 'TICKET_ASIGNADO',
  CAMBIO_ESTADO: 'CAMBIO_ESTADO',
  TICKET_RESUELTO: 'TICKET_RESUELTO'
};
