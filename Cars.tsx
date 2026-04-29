import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { BatteryIndicator, Modal, Alert, ProgressBar } from '../components/shared/index';
import { useAppStore } from '../store/useAppStore';
import type { Car } from '../types';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';

const statusLabel: Record<string, string> = {
  available: 'Disponível',
  reserved: 'Reservado',
  in_use: 'Em uso',
  maintenance: 'Manutenção',
};

export const Cars: React.FC = () => {
  const { cars, reserveCar, currentUser } = useAppStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available'>('available');
  const [minBattery, setMinBattery] = useState(0);
  const [selected, setSelected] = useState<Car | null>(null);
  const [weeks, setWeeks] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState('');

  const filtered = cars.filter(c => {
    const matchSearch = `${c.brand} ${c.model} ${c.location}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === 'available';
    const matchBattery = c.batteryLevel >= minBattery;
    return matchSearch && matchFilter && matchBattery;
  });

  const handleReserve = () => {
    if (!selected) return;
    const result = reserveCar(selected.id, weeks);
    setToast(result.message);
    setConfirmOpen(false);
    setSelected(null);
    setTimeout(() => setToast(''), 4000);
  };

  const cost = selected ? (weeks === 1 ? selected.pricePerWeek : selected.pricePerDay * weeks * 7) : 0;

  return (
    <div className="flex-1 overflow-y-auto page-enter">
      <Header title="Veículos" subtitle="Alugue o carro ideal para sua rotina" />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar modelo, marca, localização..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none transition-all font-body"
              style={{ background: 'var(--surface-700)', borderColor: 'var(--surface-500)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(57,255,20,0.5)'}
              onBlur={e => e.target.style.borderColor = 'var(--surface-500)'}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'available'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium font-display transition-all ${filter === f ? 'volt-btn-primary' : 'volt-btn-ghost'}`}>
                {f === 'all' ? 'Todos' : 'Disponíveis'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} style={{ color: 'var(--text-secondary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Bateria mín:</span>
            <input type="range" min={0} max={80} step={10} value={minBattery}
              onChange={e => setMinBattery(Number(e.target.value))}
              className="w-24 accent-[#39ff14]" />
            <span className="text-xs font-mono">{minBattery}%</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(car => (
            <div key={car.id} className="volt-card flex flex-col gap-4"
              style={car.status === 'available' ? {} : { opacity: 0.65 }}>
              <div className="flex items-start justify-between">
                <span className="text-4xl">{car.image}</span>
                <span className={`status-${car.status}`}>{statusLabel[car.status]}</span>
              </div>

              <div>
                <p className="font-display font-bold text-lg leading-tight">{car.brand} {car.model}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={12} style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{car.location}</p>
                </div>
              </div>

              <BatteryIndicator level={car.batteryLevel} />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Autonomia</span>
                  <span className="font-mono">{car.autonomy} km</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Diária</span>
                  <span className="font-mono">R$ {car.pricePerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Semanal</span>
                  <span className="font-mono font-medium neon-text">R$ {car.pricePerWeek}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-auto">
                {car.features.map(f => (
                  <span key={f} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--surface-600)', color: 'var(--text-secondary)' }}>{f}</span>
                ))}
              </div>

              <div>
                <ProgressBar value={car.utilizationRate} label="Utilização" color={car.utilizationRate > 80 ? '#ffd32a' : 'var(--neon)'} />
              </div>

              <button
                disabled={car.status !== 'available'}
                className={car.status === 'available' ? 'volt-btn-primary w-full' : 'volt-btn-ghost w-full opacity-50 cursor-not-allowed'}
                onClick={() => { setSelected(car); setConfirmOpen(true); }}
              >
                {car.status === 'available' ? 'Reservar ⚡' : 'Indisponível'}
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum veículo encontrado com esses filtros.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reserve Modal */}
      <Modal open={confirmOpen} onClose={() => { setConfirmOpen(false); setSelected(null); }} title="Confirmar reserva">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--surface-700)' }}>
              <span className="text-4xl">{selected.image}</span>
              <div>
                <p className="font-display font-bold">{selected.brand} {selected.model}</p>
                <BatteryIndicator level={selected.batteryLevel} size="sm" />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>PERÍODO</p>
              <div className="flex gap-2">
                {[1, 2, 4].map(w => (
                  <button key={w} onClick={() => setWeeks(w)}
                    className={`flex-1 py-2 rounded-xl text-sm font-display font-medium transition-all ${weeks === w ? 'volt-btn-primary' : 'volt-btn-ghost'}`}>
                    {w === 1 ? '1 semana' : `${w} semanas`}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Total a cobrar</span>
                <span className="font-mono font-bold neon-text text-lg">R$ {cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Saldo após reserva</span>
                <span className="font-mono">{currentUser ? `R$ ${(currentUser.balance - cost).toFixed(2)}` : '-'}</span>
              </div>
            </div>

            <Alert type="warning">
              Ao reservar, você concorda com a cobrança antecipada de <strong>R$ {cost.toFixed(2)}</strong>.
              Cancelamento gratuito até 4h antes. Após esse prazo, multa de 50%.
            </Alert>

            <div className="flex gap-3">
              <button className="volt-btn-ghost flex-1" onClick={() => setConfirmOpen(false)}>Cancelar</button>
              <button className="volt-btn-primary flex-1" onClick={handleReserve}>Confirmar ⚡</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-medium shadow-lg z-50 font-display"
          style={{ background: 'var(--neon)', color: '#0a0a0f', boxShadow: '0 0 20px rgba(57,255,20,0.4)' }}>
          {toast}
        </div>
      )}
    </div>
  );
};
