import React from 'react';
import { Header } from '../components/layout/Header';
import { StatCard, ProgressBar } from '../components/shared/index';
import { mockAnalytics } from '../mock/data';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import { TrendingUp, Zap, Car, AlertTriangle } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl border text-sm" style={{ background: 'var(--surface-700)', borderColor: 'var(--surface-500)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <p className="font-mono font-bold neon-text">R$ {payload[0].value.toLocaleString('pt-BR')}</p>
      </div>
    );
  }
  return null;
};

export const AdminDashboard: React.FC = () => {
  const data = mockAnalytics;

  return (
    <div className="flex-1 overflow-y-auto page-enter">
      <Header title="Painel Admin" subtitle="Visão executiva da frota e receita" />

      <div className="p-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Receita total"
            value={`R$ ${data.totalRevenue.toLocaleString('pt-BR')}`}
            icon={<TrendingUp size={16} style={{ color: 'var(--neon)' }} />}
            delta="+12.4%"
            accent
          />
          <StatCard
            label="Utilização frota"
            value={`${data.vehicleUtilization}%`}
            icon={<Car size={16} className="text-blue-400" />}
            delta="+3.1%"
          />
          <StatCard
            label="Ocupação estações"
            value={`${data.stationOccupancy}%`}
            icon={<Zap size={16} className="text-yellow-400" />}
            delta="+5.7%"
          />
          <StatCard
            label="No-show rate"
            value={`${data.noShowRate}%`}
            icon={<AlertTriangle size={16} className="text-red-400" />}
            delta="-2.1%"
            sub="meta: abaixo de 10%"
          />
        </div>

        {/* Revenue chart */}
        <div className="volt-card">
          <h2 className="font-display font-semibold text-base mb-5 flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--neon)' }} />
            Receita semanal
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.weeklyRevenue} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#39ff14" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#39ff14" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#39ff14" strokeWidth={2} fill="url(#revenueGrad)" dot={{ fill: '#39ff14', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Asset performance */}
          <div className="volt-card">
            <h2 className="font-display font-semibold text-base mb-5 flex items-center gap-2">
              <Car size={16} className="text-blue-400" />
              Performance dos ativos
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.assetPerformance} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  content={({ active, payload, label }) => active && payload?.length ? (
                    <div className="px-3 py-2 rounded-xl border text-xs" style={{ background: 'var(--surface-700)', borderColor: 'var(--surface-500)' }}>
                      <p className="font-bold mb-1">{label}</p>
                      <p style={{ color: 'var(--neon)' }}>Utilização: {payload[0]?.value}%</p>
                      <p style={{ color: '#60a5fa' }}>Receita: R$ {payload[1]?.value?.toLocaleString('pt-BR')}</p>
                    </div>
                  ) : null}
                />
                <Bar dataKey="utilization" fill="#39ff14" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar dataKey="revenue" fill="#60a5fa" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{ background: 'var(--neon)' }} /> Utilização %</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block bg-blue-400" /> Receita (R$)</span>
            </div>
          </div>

          {/* Insights */}
          <div className="volt-card">
            <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
              🧠 Insights automáticos
            </h2>
            <div className="space-y-3">
              {data.insights.map((insight, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-700)' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0"
                    style={{ background: 'var(--neon)', color: '#0a0a0f' }}>
                    {i + 1}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Peak hours heatmap mock */}
        <div className="volt-card">
          <h2 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
            🔥 Horários de pico — demanda por hora
          </h2>
          <div className="flex gap-1">
            {Array.from({ length: 24 }, (_, h) => {
              const isPeak = data.peakHours.includes(h);
              const intensity = isPeak ? 0.9 : h >= 23 || h <= 5 ? 0.15 : 0.35;
              return (
                <div key={h} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded transition-all"
                    style={{
                      height: isPeak ? 60 : h >= 23 || h <= 5 ? 20 : 35,
                      background: isPeak ? `rgba(57,255,20,${intensity})` : `rgba(57,255,20,${intensity * 0.5})`,
                      boxShadow: isPeak ? '0 0 8px rgba(57,255,20,0.4)' : 'none',
                    }}
                  />
                  <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)', fontSize: 9 }}>
                    {h}h
                  </p>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{ background: 'rgba(57,255,20,0.9)' }} /> Pico (+55%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{ background: 'rgba(57,255,20,0.15)' }} /> Off-peak (–37%)</span>
          </div>
        </div>

        {/* Revenue by asset */}
        <div className="volt-card">
          <h2 className="font-display font-semibold text-base mb-4">📊 Receita por ativo</h2>
          <div className="space-y-3">
            {data.assetPerformance.map(asset => (
              <div key={asset.name} className="flex items-center gap-4">
                <p className="text-sm font-mono w-24 shrink-0">{asset.name}</p>
                <div className="flex-1">
                  <ProgressBar
                    value={asset.utilization}
                    color={asset.utilization > 85 ? '#ffd32a' : asset.utilization > 60 ? 'var(--neon)' : '#ff4757'}
                  />
                </div>
                <p className="text-sm font-mono w-24 text-right" style={{ color: 'var(--text-secondary)' }}>
                  R$ {asset.revenue.toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
