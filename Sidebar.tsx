import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Car, Zap, CreditCard, Bell, LogOut, Settings, BarChart2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/cars', icon: <Car size={18} />, label: 'Veículos' },
  { to: '/stations', icon: <Zap size={18} />, label: 'Recargas' },
  { to: '/payments', icon: <CreditCard size={18} />, label: 'Pagamentos' },
  { to: '/admin', icon: <BarChart2 size={18} />, label: 'Admin', adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAppStore();

  return (
    <aside className="w-60 min-h-screen flex flex-col bg-surface-800 border-r border-surface-600">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-surface-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'var(--neon)', color: '#0a0a0f' }}>
            ⚡
          </div>
          <span className="font-display font-bold text-xl tracking-tight neon-text">VoltRide</span>
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Frota elétrica inteligente</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems
          .filter(item => !item.adminOnly || currentUser?.role === 'admin')
          .map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--neon-dim)] text-[var(--neon)] border border-[rgba(57,255,20,0.2)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-surface-700'
                }`
              }
            >
              {item.icon}
              <span className="font-display">{item.label}</span>
            </NavLink>
          ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-surface-600 space-y-1">
        <div className="px-3 py-2 rounded-xl bg-surface-700 mb-3">
          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Plano {currentUser?.plan === 'basic' ? '🥉 Basic' : currentUser?.plan === 'pro' ? '🥈 Pro' : '🥇 Premium'}
          </p>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--neon)' }}>
            R$ {currentUser?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-150 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-400/10"
          onClick={logout}
        >
          <LogOut size={16} />
          <span className="font-display">Sair</span>
        </button>
      </div>
    </aside>
  );
};
