import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('carlos@voltride.com');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 800)); // simulate async
    const ok = login(email, password);
    setLoading(false);
    if (ok) navigate('/dashboard');
    else setError('Credenciais inválidas. Tente novamente.');
  };

  const quickLogin = (role: 'driver' | 'admin') => {
    const emails = { driver: 'carlos@voltride.com', admin: 'admin@voltride.com' };
    setEmail(emails[role]);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4" style={{ background: 'var(--surface-900)' }}>
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, var(--neon), transparent)' }} />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold"
              style={{ background: 'var(--neon)', color: '#0a0a0f', boxShadow: '0 0 20px rgba(57,255,20,0.5)' }}>
              ⚡
            </div>
          </div>
          <h1 className="font-display font-bold text-4xl neon-text tracking-tight">VoltRide</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Frota elétrica para motoristas profissionais</p>
        </div>

        {/* Card */}
        <div className="volt-card border-surface-500">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 font-display" style={{ color: 'var(--text-secondary)' }}>
                E-MAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none border transition-all"
                style={{
                  background: 'var(--surface-700)',
                  borderColor: 'var(--surface-500)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(57,255,20,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--surface-500)'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 font-display" style={{ color: 'var(--text-secondary)' }}>
                SENHA
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none border transition-all"
                style={{
                  background: 'var(--surface-700)',
                  borderColor: 'var(--surface-500)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(57,255,20,0.5)'}
                onBlur={e => e.target.style.borderColor = 'var(--surface-500)'}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 font-mono text-center">{error}</p>
            )}

            <button type="submit" className="volt-btn-primary w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-50" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Entrando...
                </>
              ) : 'Entrar no app ⚡'}
            </button>
          </form>

          {/* Quick access */}
          <div className="mt-5 pt-5 border-t border-surface-600">
            <p className="text-xs text-center mb-3" style={{ color: 'var(--text-secondary)' }}>Acesso rápido (demo)</p>
            <div className="flex gap-2">
              <button
                onClick={() => quickLogin('driver')}
                className="flex-1 volt-btn-ghost text-xs py-2"
              >
                🚗 Motorista
              </button>
              <button
                onClick={() => quickLogin('admin')}
                className="flex-1 volt-btn-ghost text-xs py-2"
              >
                📊 Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>
          MVP — dados simulados para demonstração
        </p>
      </div>
    </div>
  );
};
