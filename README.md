# ⚡ VoltRide — MVP

Plataforma de locação de carros elétricos para motoristas de aplicativos.

## 🚀 Como rodar

```bash
cd voltride
npm install
npm run dev
```

Acesse: http://localhost:5173

## 🔐 Credenciais de demo

| Role      | Email                    | Senha  |
|-----------|--------------------------|--------|
| Motorista | carlos@voltride.com      | 123456 |
| Admin     | admin@voltride.com       | 123456 |

## 🧩 Funcionalidades implementadas

- ✅ Autenticação mock com Zustand
- ✅ Dashboard do motorista (carro ativo, bateria, recargas)
- ✅ Listagem e filtro de veículos com reserva
- ✅ Estações de recarga com preço dinâmico (pico/off-peak)
- ✅ Agendamento de recarga (gratuita ou paga)
- ✅ Histórico de transações e cancelamento de reservas
- ✅ Dashboard admin com gráficos (Recharts)
- ✅ Sugestões inteligentes automáticas
- ✅ Compliance: aviso de cobrança antecipada
- ✅ Penalidade por cancelamento tardio
- ✅ UI dark/electric com Tailwind CSS

## 🏗️ Estrutura

```
src/
├── types/          # Tipos TypeScript
├── mock/           # Dados mockados
├── store/          # Zustand store (estado global)
├── components/
│   ├── layout/     # Sidebar, Header
│   └── shared/     # BatteryIndicator, StatCard, Modal, etc.
└── pages/          # Login, Dashboard, Cars, Stations, Payments, Admin
```

## 🔧 Stack

- Vite + React + TypeScript
- Zustand (estado global)
- Tailwind CSS (estilo)
- Recharts (gráficos)
- React Router v6
- date-fns (formatação de datas)
- Lucide React (ícones)
