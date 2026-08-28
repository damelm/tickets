import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { homeForRole } from '../auth/ProtectedRoute.jsx';

export function Login() {
  const { login, loginWithGoogle, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) return;

    async function handleCredential(response) {
      setError(null);
      try {
        const loggedInUser = await loginWithGoogle(response.credential);
        navigate(homeForRole(loggedInUser.role), { replace: true });
      } catch (err) {
        setError(err.message);
      }
    }

    let cancelled = false;
    const interval = setInterval(() => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;
      clearInterval(interval);
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredential,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      });
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isAuthenticated, loginWithGoogle, navigate]);

  if (isAuthenticated) return <Navigate to={homeForRole(user.role)} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(homeForRole(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(160deg, #f5f6ff 0%, #fafafa 55%, #f3f4f6 100%)' }}
    >
      <div className="w-[380px] bg-surface border border-border rounded-xl p-9 shadow-sm">
        <div className="flex flex-col items-center gap-3 mb-7">
          <div className="w-11 h-11 rounded-[10px] bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <svg className="w-[22px] h-[22px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="font-semibold text-lg text-ink">TicketHub</div>
        </div>

        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        <div className="flex justify-center" ref={googleButtonRef} />

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setShowPasswordForm((v) => !v)}
            className="text-xs text-ink-faint hover:text-ink-muted"
          >
            Usar contraseña
          </button>
        </div>

        {showPasswordForm && (
          <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-ink"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-accent text-white rounded-md text-sm font-semibold disabled:opacity-60"
            >
              {submitting ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
