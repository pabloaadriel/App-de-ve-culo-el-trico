import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/shared/index';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, ArrowUpCircle } from 'lucide-react';
import type { ReservationStatus } from '../types';

const statusLabel: Record<ReservationStatus, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'No-show',
};

export const Payments: React.FC = () => {
  const { transactions, reservations, currentUser, cancelReservation } = useAppStore();
  const [tab, setTab] = useState<'transactions' | 'reservations'>('transactions');
  const [toast, setToast] = useState('');

  const userTxns = transactions.filter(t => t.userId === currentUser?.id);
  const userRes = reservations.filter(r => r.userId === currentUser?.id);

  const totalSpent = userTxns.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalDeposited = userTxns.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);

  const handleCancel = (resId: string) => {
    cancelReservation(resId);
    setToast('Reserva cancelada com sucesso.');
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto page-enter">
      <Header title="Pagamentos" subtitle="Histórico de cobranças e reservas" />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Saldo atual"
            value={`R$ ${currentUser?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<ArrowUpCircle size={16} style={{ color: 'var(--neon)' }} />}
            accent
          />
          <StatCard
            label="Total depositado"
            value={`R$ ${totalDeposited.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<TrendingUp size={16} className="text-blue-400" />}
          />
          <StatCard
            label="Total gasto"
            value={`R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<TrendingDown size={16} className="text-red-400" />}
          />
          <StatCard
            label="Reservas totais"
            value={`${userRes.length}`}
            icon={<span>📋</span>}
            sub={`${userRes.filter(r => r.status === 'completed').length} concluídas`}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['transactions', 'reservations'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-display font-medium transition-all ${tab === t ? 'volt-btn-primary' : 'volt-btn-ghost'}`}>
              {t === 'transactions' ? '💳 Transações' : '📋 Reservas'}
            </button>
          ))}
        </div>

        {/* Transactions */}
        {tab === 'transactions' && (
          <div className="volt-card">
            <div className="space-y-1">
              {userTxns.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhuma transação ainda.</p>
              )}
              {userTxns.map(t => (
                <div key={t.id} className="flex items-center justify-between py-3 border-b border-surface-600 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                      t.type === 'deposit' ? 'bg-green-400/10' :
                      t.type === 'refund' ? 'bg-blue-400/10' :
                      t.type === 'penalty' ? 'bg-red-400/10' : 'bg-surface-600'
                    }`}>
                      {t.type === 'deposit' ? '⬆️' : t.type === 'refund' ? '↩️' : t.type === 'penalty' ? '⚠️' : '💳'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.description}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                        {format(new Date(t.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <p className={`font-mono font-semibold ${t.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {t.amount >= 0 ? '+' : ''}R$ {Math.abs(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reservations */}
        {tab === 'reservations' && (
          <div className="space-y-3">
            {userRes.length === 0 && (
              <div className="volt-card text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Nenhuma reserva encontrada.</p>
              </div>
            )}
            {userRes.map(r => (
              <div key={r.id} className="volt-card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{r.type === 'car' ? '🚗' : '⚡'}</span>
                      <p className="font-display font-semibold">{r.resourceName}</p>
                      <span className={`status-${r.status}`}>{statusLabel[r.status]}</span>
                    </div>
                    <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {format(new Date(r.startTime), "dd/MM/yyyy HH:mm")} → {format(new Date(r.endTime), "dd/MM/yyyy HH:mm")}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      {r.isFreeCharge ? (
                        <span className="text-xs" style={{ color: 'var(--neon)' }}>⚡ Recarga gratuita</span>
                      ) : (
                        <p className="text-sm font-mono font-semibold">R$ {r.totalCost.toFixed(2)}</p>
                      )}
                      {r.penalty && (
                        <span className="text-xs text-red-400 font-mono">Multa: R$ {r.penalty.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  {(r.status === 'active' || r.status === 'pending') && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-all font-display whitespace-nowrap"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-medium shadow-lg z-50 font-display"
          style={{ background: 'var(--neon)', color: '#0a0a0f', boxShadow: '0 0 20px rgba(57,255,20,0.4)' }}>
          {toast}
        </div>
      )}
    </div>
  );
};
