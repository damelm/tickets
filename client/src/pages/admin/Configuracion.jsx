import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getSettings, updateSettings } from '../../api/settings.js';
import { Spinner, LoadingState } from '../../components/Spinner.jsx';
import { ErrorState, InlineError } from '../../components/ErrorState.jsx';

export function Configuracion() {
  const { token } = useAuth();
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getSettings(token);
      setDomain(res.googleAllowedDomain ?? '');
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await updateSettings(token, domain.trim() || null);
      setDomain(res.googleAllowedDomain ?? '');
      setStatus({ type: 'ok', message: 'Cambios guardados.' });
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

      {loading && (
        <div className="bg-surface border border-border rounded-lg">
          <LoadingState label="Cargando configuración..." />
        </div>
      )}

      {!loading && loadError && (
        <div className="bg-surface border border-border rounded-lg">
          <ErrorState title="No pudimos cargar la configuración" message={loadError} onRetry={load} />
        </div>
      )}

      {!loading && !loadError && (
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

          {status?.type === 'error' && <InlineError message={status.message} className="mt-3" />}
          {status?.type === 'ok' && (
            <div className="flex items-center gap-1.5 text-[13px] text-green-700 mt-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
              {status.message}
            </div>
          )}

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <Spinner size="sm" />}
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
