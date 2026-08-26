import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listDepartments, toggleDepartment } from '../../api/departments.js';
import { ToggleSwitch } from '../../components/ToggleSwitch.jsx';

export function ConfigDepartamentos() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    listDepartments(token).then((res) => setDepartments(res.items));
  }, [token]);

  async function handleToggle(id, next) {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, accepts_tickets: next } : d)));
    await toggleDepartment(token, id, next);
  }

  return (
    <div className="px-7 py-6 max-w-4xl mx-auto">
      <div className="font-semibold text-xl text-ink mb-1">Configuración de departamentos</div>
      <div className="text-sm text-ink-muted mb-5">Definí qué departamentos pueden recibir tickets nuevos.</div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Departamento</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Miembros</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Recibe tickets</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-2.5 text-sm text-ink font-medium">{d.name}</td>
                <td className="px-4 py-2.5 text-[13px] text-ink-muted">{d.member_count}</td>
                <td className="px-4 py-2.5 text-right">
                  <ToggleSwitch checked={d.accepts_tickets} onChange={(next) => handleToggle(d.id, next)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
