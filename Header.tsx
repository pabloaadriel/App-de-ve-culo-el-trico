import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { notifications, markNotificationRead } = useAppStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-surface-600 bg-surface-800/50 backdrop-blur-sm sticky top-0 z-10">
      <div>
        <h1 className="font-display font-bold text-2xl tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowNotifs(!showNotifs)}
          className="relative p-2.5 rounded-xl border border-surface-500 hover:border-[rgba(57,255,20,0.4)] transition-all hover:bg-[var(--neon-dim)]"
        >
          <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-mono font-bold flex items-center justify-center"
              style={{ background: 'var(--neon)', color: '#0a0a0f' }}>
              {unread}
            </span>
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-12 w-80 volt-card shadow-2xl border border-surface-500 z-50">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-semibold text-sm">Notificações</p>
              <button onClick={() => setShowNotifs(false)}>
                <X size={14} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>Sem notificações</p>
              )}
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${n.read ? 'border-surface-600 opacity-60' : 'border-surface-500 bg-surface-700'}`}
                  onClick={() => markNotificationRead(n.id)}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
