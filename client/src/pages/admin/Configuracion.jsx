import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getSettings, updateSettings } from '../../api/settings.js';

export function Configuracion() {
  const { token } = useAuth();
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings(token).then((res) => setDomain(res.googleAllowedDomain ?? ''));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await updateSettings(token, domain.trim() || null);
      setDomain(res.googleAllowedDomain ?? '');
      setStatus({ type: 'ok', message: 'Guardado.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-7 py-6 max-w-xl mx-auto">
      <div className="font-semibold text-xl text-ink mb-1">Configuración</div>
      <div className="text-sm text-ink-muted mb-5">Parámetros generales del sistema.</div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-5">
        <label className="block text-[13px] font-medium text-ink-soft mb-1.5" htmlFor="domain">
          Dominio de email permitido para "Iniciar sesión con Google"
        </label>
        <input
          id="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="empresa.com (vacío = sin restricción)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-ink"
        />

        {status && (
          <div className={`text-sm mt-2 ${status.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>
            {status.message}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-accent text-white rounded-md text-sm font-semibold disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
