import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tickets } from '../services/api';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { getStatusColor, getPriorityColor, getSLAColor, formatDate } from '../utils/helpers';

export default function DashboardAuxiliar() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('mis-tickets');
  const [ticketsList, setTicketsList] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        tickets.getAll({ filter: activeTab }),
        tickets.getStats()
      ]);

      setTicketsList(ticketsRes.data.tickets);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeTicket = async (ticketId) => {
    try {
      await tickets.take(ticketId);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al tomar ticket');
    }
  };

  const handleOpenTicket = async (ticket) => {
    try {
      const response = await tickets.getById(ticket.id);
      setSelectedTicket(response.data.ticket);
      setFormData({
        estado: response.data.ticket.estado,
        comentarios: response.data.ticket.comentarios || ''
      });
    } catch (err) {
      console.error('Error al cargar ticket:', err);
    }
  };

  const handleUpdateTicket = async () => {
    setUpdating(true);
    try {
      await tickets.update(selectedTicket.id, formData);
      setSelectedTicket(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleUnassign = async () => {
    if (!confirm('¿Deseas desasignar este ticket?')) return;

    try {
      await tickets.unassign(selectedTicket.id);
      setSelectedTicket(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al desasignar ticket');
    }
  };

  if (loading && !stats) {
    return <Loading />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">👋 Hola, {user?.nombre}</h1>
          <p className="text-slate-600">Panel de Técnico</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <div className="text-sm text-slate-600">Mis Tickets</div>
              <div className="text-3xl font-bold text-teal-700 mt-2">{stats.misTickets}</div>
            </div>
            <div className="card bg-red-50 border-red-200">
              <div className="text-sm text-red-600 font-medium">🔥 Críticos</div>
              <div className="text-3xl font-bold text-red-700 mt-2">{stats.criticos}</div>
            </div>
            <div className="card">
              <div className="text-sm text-slate-600">👤 Sin Asignar</div>
              <div className="text-3xl font-bold text-slate-700 mt-2">{stats.sinAsignar}</div>
            </div>
            <div className={`card ${stats.proximosVencer > 0 ? 'bg-yellow-50 border-yellow-200' : ''}`}>
              <div className={`text-sm ${stats.proximosVencer > 0 ? 'text-yellow-600 font-medium' : 'text-slate-600'}`}>
                ⚠️ Próximos a Vencer
              </div>
              <div className={`text-3xl font-bold mt-2 ${stats.proximosVencer > 0 ? 'text-yellow-700' : 'text-slate-700'}`}>
                {stats.proximosVencer}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 px-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('mis-tickets')}
                className={`tab ${activeTab === 'mis-tickets' ? 'tab-active' : ''}`}
              >
                📋 Mis Tickets
              </button>
              <button
                onClick={() => setActiveTab('sin-asignar')}
                className={`tab ${activeTab === 'sin-asignar' ? 'tab-active' : ''}`}
              >
                👤 Sin Asignar ({stats?.sinAsignar || 0})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="p-4">
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">SLA</th>
                      {activeTab === 'sin-asignar' && (
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Acción</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ticketsList.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => activeTab === 'mis-tickets' && handleOpenTicket(ticket)}
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
                        <td className="px-4 py-3">
                          <Badge color={getSLAColor(ticket.sla?.status)}>
                            {ticket.sla?.display}
                          </Badge>
                        </td>
                        {activeTab === 'sin-asignar' && (
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTakeTicket(ticket.id);
                              }}
                              className="px-3 py-1 bg-teal-700 text-white text-sm rounded hover:bg-teal-600"
                            >
                              Tomar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalle */}
      {selectedTicket && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket #${selectedTicket.id}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Solicitante</label>
                <p className="mt-1 text-sm text-slate-900">{selectedTicket.solicitante}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Contacto</label>
                <p className="mt-1 text-sm text-slate-900">{selectedTicket.contacto}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Título</label>
              <p className="mt-1 text-sm text-slate-900">{selectedTicket.titulo}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Descripción</label>
              <p className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{selectedTicket.descripcion}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select
                className="select"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <option value="Nuevo">Nuevo</option>
                <option value="En curso">En curso</option>
                <option value="Pausado">Pausado</option>
                <option value="Resuelto">Resuelto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Comentarios / Solución
                {formData.estado === 'Resuelto' && <span className="text-red-500"> *</span>}
              </label>
              <textarea
                className="textarea"
                rows={4}
                value={formData.comentarios}
                onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                placeholder="Describe la solución aplicada o agrega comentarios..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={handleUnassign}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Desasignar Ticket
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateTicket}
                  disabled={updating}
                  className="btn-primary disabled:opacity-50"
                >
                  {updating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
