import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Modal, Alert, ProgressBar, StatCard } from '../components/shared/index';
import { useAppStore } from '../store/useAppStore';
import type { ChargingStation } from '../types';
import { Zap, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { pricingConfig } from '../mock/data';

const statusLabel: Record<string, string> = {
  free: 'Livre',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  maintenance: 'Manutenção',
};

const isPeakHour = (hour: number) => [7, 8, 9, 17, 18, 19, 20].includes(hour);

export const Stations: React.FC = () => {
  const { stations, reserveStation, currentUser } = useAppStore();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selected, setSelected] = useState<ChargingStation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [schedTime, setSchedTime] = useState('');
  const [useFree, setUseFree] = useState(false);
  const [toast, setToast] = useState('');

  const freeLeft = (currentUser?.freeChargesPerWeek ?? 0) - (currentUser?.usedChargesThisWeek ?? 0);

  const getDynamicPrice = (station: ChargingStation, timeStr: string) => {
    if (!timeStr) return station.pricePerKwh;
    const hour = new Date(timeStr).getHours();
    const peak = isPeakHour(hour);
    return peak
      ? +(station.pricePerKwh * pricingConfig.peakMultiplier).toFixed(2)
      : +(station.pricePerKwh * (1 - pricingConfig.offPeakDiscount)).toFixed(2);
  };

  const estimatedCost = selected && schedTime && !useFree
    ? +(getDynamicPrice(selected, schedTime) * 40).toFixed(2)
    : 0;

  const handleReserve = () => {
    if (!selected || !schedTime) return;
    const result = reserveStation(selected.id, schedTime, useFree);
    setToast(result.message);
    setModalOpen(false);
    setSelected(null);
    setSchedTime('');
    setUseFree(false);
    setTimeout(() => setToast(''), 4000);
  };

  const openModal = (station: ChargingStation) => {
    setSelected(station);
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    setSchedTime(now.toISOString().slice(0, 16));
    setUseFree(freeLeft > 0);
    setModalOpen(true);
  };

  return (
    <div className="flex-1 overflow-y-auto page-enter">
      <Header title="Estações de Recarga" subtitle="Agende sua recarga com desconto inteligente" />

      <div className="p-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Estações livres"
            value={`${stations.filter(s => s.status === 'free').length}`}
            icon={<Zap size={16} style={{ color: 'var(--neon)' }} />}
            accent
          />
          <StatCard
            label="Recargas gratuitas"
            value={`${freeLeft}`}
            icon={<span>⚡</span>}
            sub="disponíveis esta semana"
          />
          <StatCard
            label="Economia off-peak"
            value="37%"
            icon={<span>💸</span>}
            sub="entre 23h e 6h"
          />
          <StatCard
            label="Preço de pico"
            value={`+55%`}
            icon={<AlertTriangle size={16} className="text-yellow-400" />}
            sub="7–9h e 17–20h"
          />
        </div>

        {/* Dynamic pricing info */}
        <div className="p-4 rounded-xl border" style={{ borderColor: 'rgba(57,255,20,0.2)', background: 'rgba(57,255,20,0.04)' }}>
          <div className="flex items-start gap-3">
            <Zap size={16} style={{ color: 'var(--neon)', marginTop: 2 }} />
            <div>
              <p className="text-sm font-display font-semibold neon-text">Preço Dinâmico Ativo</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Horários de pico (7–9h, 17–20h): +55% • Horários livres (23h–6h): –37%
                {isPeakHour(new Date().getHours()) ? ' • ⚠️ Você está em horário de pico agora!' : ' • ✅ Agora é horário econômico!'}
              </p>
            </div>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-2">
          {(['list', 'map'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-2 rounded-xl text-sm font-display font-medium transition-all ${view === v ? 'volt-btn-primary' : 'volt-btn-ghost'}`}>
              {v === 'list' ? '☰ Lista' : '🗺️ Mapa (mock)'}
            </button>
          ))}
        </div>

        {/* List view */}
        {view === 'list' && (
          <div className="space-y-4">
            {stations.map(s => {
              const currentHour = new Date().getHours();
              const peak = isPeakHour(currentHour);
              const displayPrice = peak
                ? +(s.pricePerKwh * pricingConfig.peakMultiplier).toFixed(2)
                : +(s.pricePerKwh * (1 - pricingConfig.offPeakDiscount)).toFixed(2);

              return (
                <div key={s.id} className="volt-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">⚡</span>
                        <div>
                          <p className="font-display font-bold">{s.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin size={11} style={{ color: 'var(--text-secondary)' }} />
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.address}</p>
                          </div>
                        </div>
                        <span className={`status-${s.status} ml-auto`}>{statusLabel[s.status]}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Conectores</p>
                          <p className="font-mono font-medium">{s.availableConnectors}/{s.connectors} livres</p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Preço/kWh agora</p>
                          <p className={`font-mono font-medium ${peak ? 'text-yellow-400' : 'neon-text'}`}>
                            R$ {displayPrice.toFixed(2)} {peak ? '🔥' : '💚'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Horário</p>
                          <p className="font-mono text-xs">{s.operatingHours}</p>
                        </div>
                        <div>
                          <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Ocupação</p>
                          <ProgressBar value={s.utilizationRate} color={s.utilizationRate > 80 ? '#ff4757' : 'var(--neon)'} />
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={s.status === 'occupied' || s.status === 'maintenance'}
                      onClick={() => openModal(s)}
                      className={s.status === 'free' || s.status === 'reserved' ? 'volt-btn-primary whitespace-nowrap' : 'volt-btn-ghost opacity-50 cursor-not-allowed whitespace-nowrap'}
                    >
                      {s.status === 'free' ? 'Agendar ⚡' : s.status === 'reserved' ? 'Ver horários' : 'Indisponível'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mock map view */}
        {view === 'map' && (
          <div className="relative rounded-2xl overflow-hidden border border-surface-500"
            style={{ height: 400, background: 'var(--surface-700)' }}>
            <div className="absolute inset-0 grid-bg opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
              <span className="text-5xl">🗺️</span>
              <p className="font-display font-semibold">Mapa integrado</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Integrar com Google Maps API ou Mapbox em produção
              </p>
            </div>
            {/* Mock pins */}
            {stations.map((s, i) => (
              <div
                key={s.id}
                className="absolute flex flex-col items-center cursor-pointer group"
                style={{ left: `${15 + i * 16}%`, top: `${20 + (i % 3) * 20}%` }}
                onClick={() => openModal(s)}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-125 ${s.status === 'free' ? 'border-green-400 bg-green-400/20' : s.status === 'occupied' ? 'border-red-400 bg-red-400/20' : 'border-yellow-400 bg-yellow-400/20'}`}>
                  ⚡
                </div>
                <p className="text-xs mt-1 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{s.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSelected(null); }} title="Agendar recarga">
        {selected && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-700)' }}>
              <p className="font-display font-bold">{selected.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{selected.address}</p>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>DATA E HORA</label>
              <input
                type="datetime-local"
                value={schedTime}
                onChange={e => setSchedTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                style={{ background: 'var(--surface-700)', borderColor: 'var(--surface-500)', color: 'var(--text-primary)' }}
              />
              {schedTime && (
                <p className={`text-xs mt-1.5 font-mono ${isPeakHour(new Date(schedTime).getHours()) ? 'text-yellow-400' : 'text-green-400'}`}>
                  {isPeakHour(new Date(schedTime).getHours())
                    ? '⚠️ Horário de pico — preço +55%'
                    : '✅ Horário econômico — preço –37%'}
                </p>
              )}
            </div>

            {freeLeft > 0 && (
              <div
                className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                style={{ borderColor: useFree ? 'rgba(57,255,20,0.5)' : 'var(--surface-500)', background: useFree ? 'rgba(57,255,20,0.06)' : 'transparent' }}
                onClick={() => setUseFree(!useFree)}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${useFree ? '' : 'border-surface-500'}`}
                  style={useFree ? { borderColor: 'var(--neon)', background: 'var(--neon)' } : {}}>
                  {useFree && <span className="text-xs text-[#0a0a0f] font-bold">✓</span>}
                </div>
                <div>
                  <p className="text-sm font-medium">Usar recarga gratuita semanal</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{freeLeft} restante(s) esta semana</p>
                </div>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(57,255,20,0.1)', color: 'var(--neon)' }}>GRÁTIS</span>
              </div>
            )}

            {!useFree && schedTime && (
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Custo estimado (~40 kWh)</span>
                  <span className="font-mono font-bold neon-text">R$ {estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Alert type="warning">
              Ao reservar, você concorda com a cobrança mesmo em caso de não comparecimento (no-show).
              Cancelamento gratuito até {pricingConfig.freeCancelHours}h antes.
            </Alert>

            <div className="flex gap-3">
              <button className="volt-btn-ghost flex-1" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button
                className="volt-btn-primary flex-1"
                onClick={handleReserve}
                disabled={!schedTime}
              >
                {useFree ? 'Agendar grátis ⚡' : `Agendar R$ ${estimatedCost.toFixed(2)}`}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-medium shadow-lg z-50 font-display"
          style={{ background: 'var(--neon)', color: '#0a0a0f', boxShadow: '0 0 20px rgba(57,255,20,0.4)' }}>
          {toast}
        </div>
      )}
    </div>
  );
};
