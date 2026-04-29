import React from 'react';

// ─── Battery Indicator ────────────────────────────────────────────────────────
interface BatteryProps {
  level: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BatteryIndicator: React.FC<BatteryProps> = ({ level, showText = true, size = 'md' }) => {
  const color = level > 50 ? 'var(--neon)' : level > 20 ? '#ffd32a' : '#ff4757';
  const width = size === 'sm' ? 36 : size === 'md' ? 48 : 64;
  const height = size === 'sm' ? 18 : size === 'md' ? 24 : 32;

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative rounded border"
        style={{ width, height, borderColor: color, borderWidth: 2 }}
      >
        {/* Positive terminal */}
        <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 rounded-r"
          style={{ width: 4, height: '40%', background: color }} />
        {/* Fill */}
        <div
          className="absolute left-0.5 top-0.5 bottom-0.5 rounded-sm transition-all duration-500"
          style={{ width: `calc(${level}% - 4px)`, background: color, opacity: 0.9 }}
        />
        {level <= 20 && <div className="absolute inset-0 battery-low" style={{ background: `${color}15`, borderRadius: 2 }} />}
      </div>
      {showText && (
        <span className="font-mono text-sm font-medium" style={{ color }}>
          {level}%
        </span>
      )}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  delta?: string;
  accent?: boolean;
  sub?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, delta, accent, sub }) => (
  <div className={`volt-card flex flex-col gap-3 ${accent ? 'border-[rgba(57,255,20,0.3)]' : ''}`}
    style={accent ? { background: 'rgba(57,255,20,0.04)' } : {}}>
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <div className="p-2 rounded-lg" style={{ background: 'var(--surface-700)' }}>{icon}</div>
    </div>
    <div>
      <p className={`font-display font-bold text-2xl ${accent ? 'neon-text' : ''}`}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
    {delta && (
      <p className={`text-xs font-mono ${delta.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{delta} esta semana</p>
    )}
  </div>
);

// ─── Progress Bar ─────────────────────────────────────────────────────────────
interface ProgressProps {
  value: number;
  color?: string;
  label?: string;
}

export const ProgressBar: React.FC<ProgressProps> = ({ value, color = 'var(--neon)', label }) => (
  <div>
    {label && <div className="flex justify-between text-xs mb-1.5">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="font-mono font-medium">{value}%</span>
    </div>}
    <div className="h-1.5 rounded-full" style={{ background: 'var(--surface-600)' }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: color }} />
    </div>
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md volt-card animate-fade-in border-surface-500">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors text-lg">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Alert Banner ─────────────────────────────────────────────────────────────
interface AlertProps {
  type?: 'warning' | 'info' | 'success';
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', children }) => {
  const styles = {
    warning: { border: 'rgba(255,211,42,0.3)', bg: 'rgba(255,211,42,0.07)', icon: '⚠️' },
    info: { border: 'rgba(57,255,20,0.2)', bg: 'rgba(57,255,20,0.05)', icon: 'ℹ️' },
    success: { border: 'rgba(57,255,20,0.4)', bg: 'rgba(57,255,20,0.08)', icon: '✅' },
  }[type];

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border text-sm"
      style={{ borderColor: styles.border, background: styles.bg }}>
      <span>{styles.icon}</span>
      <p style={{ color: 'var(--text-secondary)' }}>{children}</p>
    </div>
  );
};
