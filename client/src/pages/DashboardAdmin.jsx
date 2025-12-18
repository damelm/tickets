import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tickets, reportes, usuarios, configuracion } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import { getStatusColor, getPriorityColor, getSLAColor, formatDate, getCategoryIcon } from '../utils/helpers';
import CreateTicket from './CreateTicket';

export default function DashboardAdmin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('gestion');
  const [ticketsList, setTicketsList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filters, setFilters] = useState({});
  const [tecnicos, setTecnicos] = useState([]);
  const [catalogos, setCatalogos] = useState(null);

  // Estados para reportes
  const [reportesData, setReportesData] = useState(null);
  const [indicadores, setIndicadores] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [periodo, setPeriodo] = useState('30');

  // Estados para configuración
  const [usuariosList, setUsuariosList] = useState([]);
  const [config, setConfig] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'gestion') {
      loadTickets();
    } else if (activeTab === 'reportes') {
      loadReportes();
    } else if (activeTab === 'analytics') {
      loadAnalytics();
    } else if (activeTab === 'configuracion') {
      loadConfiguracion();
    }
  }, [activeTab, filters, periodo]);

  const loadInitialData = async () => {
    try {
      const [tecnicosRes, catalogosRes] = await Promise.all([
        usuarios.getTecnicos(),
        configuracion.getCatalogos()
      ]);

      setTecnicos(tecnicosRes.data.tecnicos);
      setCatalogos(catalogosRes.data.catalogos);
    } catch (err) {
      console.error('Error al cargar datos iniciales:', err);
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        tickets.getAll(filters),
        tickets.getStats()
      ]);

      setTicketsList(ticketsRes.data.tickets);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Error al cargar tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReportes = async () => {
    setLoading(true);
    try {
      const [generalRes, indicadoresRes] = await Promise.all([
        reportes.getGeneral(),
        reportes.getIndicadores()
      ]);

      setReportesData(generalRes.data.reportes);
      setIndicadores(indicadoresRes.data.indicadores);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await reportes.getAnalytics(periodo);
      setAnalytics(response.data.analytics);
    } catch (err) {
      console.error('Error al cargar analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguracion = async () => {
    setLoading(true);
    try {
      const [usuariosRes, configRes] = await Promise.all([
        usuarios.getAll(),
        configuracion.get()
      ]);

      setUsuariosList(usuariosRes.data.usuarios);
      setConfig(configRes.data.configuracion);
    } catch (err) {
      console.error('Error al cargar configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicket = async (ticket) => {
    try {
      const response = await tickets.getById(ticket.id);
      setSelectedTicket(response.data);
    } catch (err) {
      console.error('Error al cargar ticket:', err);
    }
  };

  const handleUpdateTicket = async (formData) => {
    try {
      await tickets.update(selectedTicket.ticket.id, formData);
      setSelectedTicket(null);
      loadTickets();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar ticket');
    }
  };

  if (activeTab === 'crear') {
    return <CreateTicket />;
  }

  if (loading && !ticketsList.length && activeTab === 'gestion') {
    return <Loading />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
          <p className="text-slate-600">Gestión completa del sistema de tickets</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 px-4">
            <div className="flex space-x-4 overflow-x-auto">
              <button onClick={() => setActiveTab('crear')} className={`tab ${activeTab === 'crear' ? 'tab-active' : ''}`}>
                ➕ Crear Ticket
              </button>
              <button onClick={() => setActiveTab('gestion')} className={`tab ${activeTab === 'gestion' ? 'tab-active' : ''}`}>
                📋 Gestión
              </button>
              <button onClick={() => setActiveTab('reportes')} className={`tab ${activeTab === 'reportes' ? 'tab-active' : ''}`}>
                📊 Reportes
              </button>
              <button onClick={() => setActiveTab('analytics')} className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}>
                📈 Analytics
              </button>
              <button onClick={() => setActiveTab('configuracion')} className={`tab ${activeTab === 'configuracion' ? 'tab-active' : ''}`}>
                ⚙️ Configuración
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* TAB: GESTIÓN */}
            {activeTab === 'gestion' && (
              <div className="space-y-6">
                {/* Stats */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="card">
                      <div className="text-sm text-slate-600">Total Activos</div>
                      <div className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</div>
                    </div>
                    <div className={`card ${stats.criticos > 0 ? 'bg-red-50 border-red-200 animate-pulse-slow' : ''}`}>
                      <div className="text-sm text-red-600 font-medium">🔥 Críticos</div>
                      <div className="text-3xl font-bold text-red-700 mt-2">{stats.criticos}</div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-slate-600">⚠️ SLA Vencido</div>
                      <div className="text-3xl font-bold text-yellow-700 mt-2">{stats.proximosVencer || 0}</div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-slate-600">👤 Sin Asignar</div>
                      <div className="text-3xl font-bold text-slate-700 mt-2">{stats.sinAsignar}</div>
                    </div>
                    <div className="card">
                      <div className="text-sm text-slate-600">⚡ En Curso</div>
                      <div className="text-3xl font-bold text-cyan-700 mt-2">{stats.enCurso}</div>
                    </div>
                  </div>
                )}

                {/* Filtros */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setFilters({})}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!filters.filter ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilters({ filter: 'criticos' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filters.filter === 'criticos' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    🔥 Críticos ({stats?.criticos || 0})
                  </button>
                  <button
                    onClick={() => setFilters({ filter: 'sin-asignar' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filters.filter === 'sin-asignar' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    👤 Sin Asignar
                  </button>
                  <button
                    onClick={() => setFilters({ filter: 'en-curso' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filters.filter === 'en-curso' ? 'bg-cyan-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    ⚡ En Curso
                  </button>
                </div>

                {/* Tabla */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-teal-700"></div>
                  </div>
                ) : ticketsList.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No hay tickets para mostrar
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Urgencia</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Título</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Sede</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Estado</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Asignado</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">SLA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {ticketsList.map((ticket) => (
                          <tr
                            key={ticket.id}
                            className={`hover:bg-slate-50 cursor-pointer ${
                              ticket.urgencia_validada === 'Crítica' ? 'bg-red-50' :
                              ticket.sla?.status === 'warn' ? 'bg-yellow-50' : ''
                            }`}
                            onClick={() => handleOpenTicket(ticket)}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">#{ticket.id}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{formatDate(ticket.fecha_creacion).split(',')[0]}</td>
                            <td className="px-4 py-3">
                              <Badge color={getPriorityColor(ticket.urgencia_validada)}>
                                {ticket.urgencia_validada}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-900 max-w-xs truncate">{ticket.titulo}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{ticket.sede}</td>
                            <td className="px-4 py-3">
                              <Badge color={getStatusColor(ticket.estado)}>
                                {ticket.estado}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">{ticket.asignado || '-'}</td>
                            <td className="px-4 py-3">
                              <Badge color={getSLAColor(ticket.sla?.status)}>
                                {ticket.sla?.display}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: REPORTES */}
            {activeTab === 'reportes' && reportesData && indicadores && (
              <div className="space-y-8">
                {/* Indicadores */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">📈 Indicadores Generales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card bg-blue-50">
                      <div className="text-sm text-blue-600 font-medium">Tickets Abiertos</div>
                      <div className="text-3xl font-bold text-blue-700 mt-2">{indicadores.abiertos}</div>
                    </div>
                    <div className="card bg-green-50">
                      <div className="text-sm text-green-600 font-medium">Tickets Cerrados</div>
                      <div className="text-3xl font-bold text-green-700 mt-2">{indicadores.cerrados}</div>
                    </div>
                    <div className="card bg-teal-50">
                      <div className="text-sm text-teal-600 font-medium">% SLA Cumplido</div>
                      <div className="text-3xl font-bold text-teal-700 mt-2">{indicadores.slaPorcentaje}%</div>
                    </div>
                    <div className="card bg-purple-50">
                      <div className="text-sm text-purple-600 font-medium">Tiempo Promedio</div>
                      <div className="text-3xl font-bold text-purple-700 mt-2">{indicadores.tiempoPromedioHoras}h</div>
                    </div>
                  </div>
                </div>

                {/* Estado del servicio */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">🚨 Estado del Servicio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card">
                      <h4 className="font-medium text-slate-900 mb-3">Tickets Críticos Sin Asignar</h4>
                      {reportesData.criticosSinAsignar.length === 0 ? (
                        <p className="text-sm text-slate-500">No hay tickets críticos sin asignar</p>
                      ) : (
                        <div className="space-y-2">
                          {reportesData.criticosSinAsignar.slice(0, 5).map(ticket => (
                            <div key={ticket.id} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded">
                              <span className="font-medium">#{ticket.id} - {ticket.titulo}</span>
                              <Badge color="red">Crítica</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="card">
                      <h4 className="font-medium text-slate-900 mb-3">Próximos a Vencer SLA</h4>
                      {reportesData.proximosVencer.length === 0 ? (
                        <p className="text-sm text-slate-500">Todo bajo control</p>
                      ) : (
                        <div className="space-y-2">
                          {reportesData.proximosVencer.slice(0, 5).map(ticket => (
                            <div key={ticket.id} className="flex items-center justify-between text-sm p-2 bg-yellow-50 rounded">
                              <span className="font-medium">#{ticket.id} - {ticket.titulo}</span>
                              <Badge color={getSLAColor(ticket.sla.status)}>{ticket.sla.display}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-8">
                {/* Selector de período */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">📊 Analytics Avanzados</h3>
                  <select
                    className="select w-auto"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                  >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="60">Últimos 60 días</option>
                    <option value="90">Últimos 90 días</option>
                    <option value="all">Todo el historial</option>
                  </select>
                </div>

                {/* Resumen Ejecutivo */}
                <div className="card">
                  <h4 className="font-semibold text-slate-900 mb-4">Resumen Ejecutivo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['totalTickets', 'tasaCierre', 'slaCumplido', 'tiempoPromedio'].map(metric => (
                      <div key={metric} className="text-center">
                        <div className="text-sm text-slate-600 capitalize">{metric.replace(/([A-Z])/g, ' $1')}</div>
                        <div className="text-2xl font-bold text-slate-900 my-2">
                          {analytics.resumenEjecutivo.actual[metric]}{metric.includes('Porcentaje') || metric.includes('Cumplido') ? '%' : ''}
                        </div>
                        <div className={`text-sm font-medium ${
                          analytics.resumenEjecutivo.cambios[metric] > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {analytics.resumenEjecutivo.cambios[metric] > 0 ? '▲' : '▼'}
                          {Math.abs(analytics.resumenEjecutivo.cambios[metric])}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comparativa de Técnicos */}
                <div className="card">
                  <h4 className="font-semibold text-slate-900 mb-4">Comparativa de Técnicos</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Técnico</th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-slate-600">Total</th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-slate-600">Cerrados</th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600">Tasa Cierre</th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-slate-600">Tiempo Promedio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {analytics.comparativaTecnicos.map(tec => (
                          <tr key={tec.tecnico}>
                            <td className="px-4 py-2 text-sm font-medium text-slate-900">{tec.tecnico}</td>
                            <td className="px-4 py-2 text-sm text-center text-slate-700">{tec.total}</td>
                            <td className="px-4 py-2 text-sm text-center text-slate-700">{tec.cerrados}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-teal-600 h-2 rounded-full"
                                    style={{ width: `${tec.tasaCierre}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{tec.tasaCierre}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-center text-slate-700">{tec.tiempoPromedio}h</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recomendaciones */}
                {analytics.recomendaciones.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">💡 Recomendaciones Inteligentes</h4>
                    {analytics.recomendaciones.map((rec, idx) => (
                      <Alert
                        key={idx}
                        type={rec.tipo === 'alert' ? 'error' : rec.tipo === 'warning' ? 'warning' : 'info'}
                        message={rec.mensaje}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CONFIGURACIÓN */}
            {activeTab === 'configuracion' && config && (
              <div className="space-y-8">
                {/* Gestión de Usuarios */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">👥 Gestión de Usuarios</h3>
                    <button className="btn-primary">➕ Agregar Usuario</button>
                  </div>
                  <div className="card overflow-hidden p-0">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Email</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Nombre</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Rol</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {usuariosList.map(usuario => (
                          <tr key={usuario.id}>
                            <td className="px-4 py-3 text-sm text-slate-900">{usuario.email}</td>
                            <td className="px-4 py-3 text-sm text-slate-900">{usuario.nombre}</td>
                            <td className="px-4 py-3 text-center">
                              <Badge color={usuario.rol === 'Admin' ? 'red' : 'cyan'}>{usuario.rol}</Badge>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge color={usuario.activo ? 'green' : 'gray'}>
                                {usuario.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Configuración SLA */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">⏱️ Configuración de SLA (horas)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['critica', 'alta', 'media', 'baja'].map(prioridad => (
                      <div key={prioridad}>
                        <label className="block text-sm font-medium text-slate-700 capitalize mb-2">
                          {prioridad}
                        </label>
                        <input
                          type="number"
                          className="input"
                          value={config[`sla_${prioridad}`]}
                          readOnly
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Autocierre */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">🔄 Autocierre de Tickets</h3>
                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Horas para autocierre después de Resuelto
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={config.autocierre_horas}
                      readOnly
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Los tickets resueltos se cierran automáticamente después de este tiempo
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de ticket (Admin) */}
      {selectedTicket && catalogos && (
        <TicketModal
          ticket={selectedTicket.ticket}
          historial={selectedTicket.historial}
          tecnicos={tecnicos}
          catalogos={catalogos}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdateTicket}
        />
      )}
    </Layout>
  );
}

// Componente Modal de Ticket para Admin
function TicketModal({ ticket, historial, tecnicos, catalogos, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    titulo: ticket.titulo,
    descripcion: ticket.descripcion,
    estado: ticket.estado,
    urgencia_validada: ticket.urgencia_validada,
    categoria: ticket.categoria,
    sede: ticket.sede,
    asignado: ticket.asignado || '',
    comentarios: ticket.comentarios || ''
  });
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async () => {
    setUpdating(true);
    try {
      await onUpdate(formData);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Ticket #${ticket.id}`} size="xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna 1: Información */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
            <input
              type="text"
              className="input"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
            <textarea
              className="textarea"
              rows={4}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Solicitante</label>
            <p className="mt-1 text-sm text-slate-900">{ticket.solicitante}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Contacto</label>
            <p className="mt-1 text-sm text-slate-900">{ticket.contacto}</p>
          </div>
        </div>

        {/* Columna 2: Gestión */}
        <div className="space-y-4">
          {ticket.prioridad_usuario !== ticket.urgencia_validada && (
            <Alert
              type="warning"
              message={`Usuario solicitó: ${ticket.prioridad_usuario}`}
            />
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
            <select
              className="select"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            >
              {catalogos.estados.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Asignado a</label>
            <select
              className="select"
              value={formData.asignado}
              onChange={(e) => setFormData({ ...formData, asignado: e.target.value })}
            >
              <option value="">Sin asignar</option>
              {tecnicos.map(tec => (
                <option key={tec} value={tec}>{tec}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Urgencia Validada</label>
            <select
              className="select"
              value={formData.urgencia_validada}
              onChange={(e) => setFormData({ ...formData, urgencia_validada: e.target.value })}
            >
              {catalogos.prioridades.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
            <select
              className="select"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            >
              {catalogos.categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Comentarios/Solución</label>
            <textarea
              className="textarea"
              rows={3}
              value={formData.comentarios}
              onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
            />
          </div>
        </div>

        {/* Columna 3: Historial */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Historial de Cambios</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {historial.slice(0, 10).map(h => (
              <div key={h.id} className="text-xs p-3 bg-slate-50 rounded">
                <div className="font-medium text-slate-900">{h.usuario}</div>
                <div className="text-slate-600 mt-1">
                  {h.campo}: {h.valor_anterior || '(vacío)'} → {h.valor_nuevo}
                </div>
                <div className="text-slate-500 mt-1">{formatDate(h.fecha)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <button onClick={onClose} className="btn-secondary">
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={updating}
          className="btn-primary disabled:opacity-50"
        >
          {updating ? 'Guardando...' : '💾 Guardar'}
        </button>
      </div>
    </Modal>
  );
}
