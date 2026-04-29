import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Zap, TrendingUp, Clock, ChevronRight, Award } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { BatteryIndicator, StatCard, ProgressBar } from '../components/shared/index';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const DriverDashboard: React.FC = () => {
  const { currentUser, reservations, cars } = useAppStore();

  const activeCarRes = reservations.find(r => r.type === 'car' && r.status === 'active' && r.userId === currentUser?.id);
  const activeCar = activeCarRes ? cars.find(c => c.id === activeCarRes.resourceId) : null;
  const pendingCharges = reservations.filter(r => r.type === 'station' && r.status === 'pending' && r.userId === currentUser?.id);
  const freeLeft = (currentUser?.freeChargesPerWeek ?? 0) - (currentUser?.usedChargesThisWeek ?? 0);

  // Smart suggestions
  const suggestions = [
    activeCar && activeCar.batteryLevel < 40
      ? `⚡ Bateria baixa! Recomendamos recarregar hoje. ${freeLeft > 0 ? 'Você tem recarga gratuita disponível!' : ''}`
      : null,
    '💡 Melhor horário para recarregar: entre 23h e 6h (economia de 37%)',
    activeCar ? `🏁 Com ${activeCar.batteryLevel}% de bateria, autonomia estimada: ${Math.round(activeCar.autonomy * activeCar.batteryLevel / 100)} km` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="flex-1 overflow-y-auto page-enter">
      <Header
        title={`Olá, ${currentUser?.name.split(' ')[0]} 👋`}
        subtitle={format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
      />

      <div className="p-8 space-y-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Saldo disponível"
            value={`R$ ${currentUser?.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<span className="text-green-400">💰</span>}
            accent
          />
          <StatCard
            label="Economia total"
            value={`R$ ${currentUser?.totalSaved.toLocaleString('pt-BR')}`}
            icon={<TrendingUp size={16} className="text-blue-400" />}
            sub="vs combustível"
          />
          <StatCard
            label="Recargas gratuitas"
            value={`${freeLeft}/${currentUser?.freeChargesPerWeek}`}
            icon={<Zap size={16} style={{ color: 'var(--neon)' }} />}
            sub="restantes esta semana"
          />
          <StatCard
            label="Reservas ativas"
            value={`${reservations.filter(r => r.status === 'active' && r.userId === currentUser?.id).length}`}
            icon={<Clock size={16} className="text-purple-400" />}
            sub="em andamento"
          />
        </div>

        {/* Active car */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="volt-card" style={activeCar ? { borderColor: 'rgba(57,255,20,0.25)', background: 'rgba(57,255,20,0.03)' } : {}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-base flex items-center gap-2">
                <Car size={16} style={{ color: 'var(--neon)' }} />
                Veículo atual
              </h2>
              {activeCar && <span className="status-in_use">Em uso</span>}
            </div>

            {activeCar && activeCarRes ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{activeCar.image}</span>
                  <div>
                    <p className="font-display font-bold text-xl">{activeCar.brand} {activeCar.model}</p>
                    <p className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{activeCar.plate}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>📍 {activeCar.location}</p>
                  </div>
                </div>
                <BatteryIndicator level={activeCar.batteryLevel} size="lg" />
                <ProgressBar value={activeCar.batteryLevel} />
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Autonomia estimada</span>
                  <span className="font-mono font-medium">~{Math.round(activeCar.autonomy * activeCar.batteryLevel / 100)} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Devolução</span>
                  <span className="font-mono font-medium">{format(new Date(activeCarRes.endTime), 'dd/MM/yyyy')}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🚫</p>
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-4">Nenhum veículo alugado</p>
                <Link to="/cars" className="volt-btn-primary text-sm">Alugar agora</Link>
              </div>
            )}
          </div>

          {/* Free charge status */}
          <div className="volt-card">
            <h2 className="font-display font-semibold text-base flex items-center gap-2 mb-4">
              <Zap size={16} style={{ color: 'var(--neon)' }} />
              Status de recarga
            </h2>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border" style={{ borderColor: 'rgba(57,255,20,0.2)', background: 'rgba(57,255,20,0.05)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Recargas gratuitas restantes</p>
                  <span className="font-display font-bold text-2xl neon-text">{freeLeft}</span>
                </div>
                <ProgressBar
                  value={((currentUser?.usedChargesThisWeek ?? 0) / (currentUser?.freeChargesPerWeek ?? 1)) * 100}
                  color={freeLeft > 0 ? 'var(--neon)' : '#ff4757'}
                />
              </div>

              {pendingCharges.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>PRÓXIMAS RECARGAS</p>
                  {pendingCharges.slice(0, 2).map(r => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-surface-600 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{r.resourceName}</p>
                        <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                          {format(new Date(r.startTime), 'dd/MM HH:mm')}
                        </p>
                      </div>
                      {r.isFreeCharge ? (
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--neon)' }}>Grátis ⚡</span>
                      ) : (
                        <span className="font-mono text-sm">R$ {r.totalCost}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Link to="/stations" className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-700 transition-colors group">
                <span className="text-sm font-medium">Agendar recarga</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" style={{ color: 'var(--neon)' }} />
              </Link>
            </div>
          </div>
        </div>

        {/* Smart suggestions */}
        <div className="volt-card">
          <h2 className="font-display font-semibold text-base flex items-center gap-2 mb-4">
            <Award size={16} className="text-yellow-400" />
            Sugestões inteligentes
          </h2>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-700)' }}>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plan upgrade */}
        {currentUser?.plan === 'basic' && (
          <div className="relative overflow-hidden volt-card" style={{ borderColor: 'rgba(255,211,42,0.3)', background: 'rgba(255,211,42,0.04)' }}>
            <div className="absolute -right-6 -top-6 text-8xl opacity-10">⭐</div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-lg">Faça upgrade para Pro</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>3 recargas gratuitas/semana + prioridade nas reservas</p>
              </div>
              <button className="font-display font-semibold text-sm px-4 py-2 rounded-xl transition-all"
                style={{ background: '#ffd32a', color: '#0a0a0f' }}>
                Upgrade ⭐
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
