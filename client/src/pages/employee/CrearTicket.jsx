import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listDepartments } from '../../api/departments.js';
import { createTicket } from '../../api/tickets.js';

const PRIORITIES = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export function CrearTicket() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('media');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listDepartments(token).then((res) => {
      setDepartments(res.items);
      if (res.items[0]) setDepartmentId(String(res.items[0].id));
    });
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ticket = await createTicket(token, {
        departmentId: Number(departmentId),
        subject,
        description,
        priority,
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto my-10 px-6">
      <div className="mb-6">
        <div className="font-semibold text-xl text-ink">Nuevo ticket</div>
        <div className="text-sm text-ink-muted mt-1">Describí tu solicitud y elegí el departamento que corresponde.</div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5" htmlFor="department">
            Departamento
          </label>
          <select
            id="department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-ink"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5" htmlFor="subject">
            Asunto
          </label>
          <input
            id="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Resumen breve de la solicitud"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-ink"
          />
        </div>

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5" htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detallá tu solicitud, incluí toda la información relevante..."
            className="w-full h-36 px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink resize-y"
          />
        </div>

        <div className="mb-6">
          <div className="text-[13px] font-medium text-ink-soft mb-2">Prioridad</div>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                type="button"
                key={p.value}
                onClick={() => setPriority(p.value)}
                className={`flex-1 text-center py-2 rounded-md text-[13px] font-semibold border ${
                  priority === p.value
                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                    : 'bg-gray-50 text-ink-muted border-border'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/mis-tickets')}
            className="px-[18px] py-2.5 bg-white text-ink-soft border border-gray-300 rounded-md text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-[18px] py-2.5 bg-accent text-white rounded-md text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? 'Creando...' : 'Crear ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
