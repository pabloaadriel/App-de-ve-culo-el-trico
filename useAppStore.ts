import { create } from 'zustand';
import type { User, Car, ChargingStation, Reservation, Transaction, Notification } from '../types';
import { mockUsers } from '../mock/data';
import { mockCars } from '../mock/cars';
import { mockStations } from '../mock/stations';
import { mockReservations, mockTransactions, mockNotifications } from '../mock/data';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, _password: string) => boolean;
  logout: () => void;

  // Data
  cars: Car[];
  stations: ChargingStation[];
  reservations: Reservation[];
  transactions: Transaction[];
  notifications: Notification[];

  // Actions
  reserveCar: (carId: string, weeks: number) => { success: boolean; message: string };
  reserveStation: (stationId: string, startTime: string, isFree: boolean) => { success: boolean; message: string };
  cancelReservation: (reservationId: string) => void;
  markNotificationRead: (id: string) => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,

  login: (email: string, _password: string) => {
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      set({ currentUser: user, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => set({ currentUser: null, isAuthenticated: false }),

  cars: mockCars,
  stations: mockStations,
  reservations: mockReservations,
  transactions: mockTransactions,
  notifications: mockNotifications,

  reserveCar: (carId: string, weeks: number) => {
    const { cars, currentUser, reservations, transactions } = get();
    const car = cars.find(c => c.id === carId);
    if (!car || !currentUser) return { success: false, message: 'Carro não encontrado.' };
    if (car.status !== 'available') return { success: false, message: 'Carro indisponível.' };

    const cost = weeks === 1 ? car.pricePerWeek : car.pricePerDay * (weeks * 7);
    if (currentUser.balance < cost) return { success: false, message: 'Saldo insuficiente.' };

    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + weeks * 7);

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      userId: currentUser.id,
      type: 'car',
      resourceId: carId,
      resourceName: `${car.brand} ${car.model}`,
      startTime: now.toISOString(),
      endTime: end.toISOString(),
      status: 'active',
      totalCost: cost,
      createdAt: now.toISOString(),
    };

    const newTxn: Transaction = {
      id: `txn-${Date.now()}`,
      userId: currentUser.id,
      type: 'charge',
      amount: -cost,
      description: `Reserva — ${car.brand} ${car.model}`,
      reservationId: newRes.id,
      createdAt: now.toISOString(),
    };

    set({
      cars: cars.map(c => c.id === carId ? { ...c, status: 'reserved' as const } : c),
      reservations: [newRes, ...reservations],
      transactions: [newTxn, ...transactions],
      currentUser: { ...currentUser, balance: currentUser.balance - cost },
    });

    return { success: true, message: `Reserva confirmada! R$ ${cost.toFixed(2)} debitados.` };
  },

  reserveStation: (stationId: string, startTime: string, isFree: boolean) => {
    const { stations, currentUser, reservations, transactions } = get();
    const station = stations.find(s => s.id === stationId);
    if (!station || !currentUser) return { success: false, message: 'Estação não encontrada.' };
    if (station.status === 'occupied') return { success: false, message: 'Estação ocupada.' };

    // Dynamic pricing: peak hours cost more
    const hour = new Date(startTime).getHours();
    const isPeak = [7, 8, 9, 17, 18, 19, 20].includes(hour);
    const kwh = 40; // average full charge
    let cost = 0;

    if (!isFree) {
      const rate = isPeak ? station.pricePerKwh * 1.55 : station.pricePerKwh * 0.63;
      cost = +(kwh * rate).toFixed(2);
    }

    const end = new Date(new Date(startTime).getTime() + 90 * 60000);
    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      userId: currentUser.id,
      type: 'station',
      resourceId: stationId,
      resourceName: station.name,
      startTime,
      endTime: end.toISOString(),
      status: 'pending',
      totalCost: cost,
      isFreeCharge: isFree,
      createdAt: new Date().toISOString(),
    };

    const updates: Partial<AppState> = {
      stations: stations.map(s => s.id === stationId ? { ...s, status: 'reserved' as const } : s),
      reservations: [newRes, ...reservations],
    };

    if (cost > 0) {
      const newTxn: Transaction = {
        id: `txn-${Date.now()}`,
        userId: currentUser.id,
        type: 'charge',
        amount: -cost,
        description: `Recarga${isPeak ? ' (horário de pico)' : ''} — ${station.name}`,
        reservationId: newRes.id,
        createdAt: new Date().toISOString(),
      };
      updates.transactions = [newTxn, ...transactions];
      updates.currentUser = { ...currentUser, balance: currentUser.balance - cost };
    } else {
      updates.currentUser = { ...currentUser, usedChargesThisWeek: currentUser.usedChargesThisWeek + 1 };
    }

    set(updates);
    return { success: true, message: isFree ? 'Recarga gratuita agendada!' : `Agendado! R$ ${cost.toFixed(2)} debitados.` };
  },

  cancelReservation: (reservationId: string) => {
    const { reservations, currentUser } = get();
    const res = reservations.find(r => r.id === reservationId);
    if (!res || !currentUser) return;

    const hoursUntil = (new Date(res.startTime).getTime() - Date.now()) / 3600000;
    const isFree = hoursUntil > 4;
    const penalty = isFree ? 0 : res.totalCost * 0.5;
    const refund = res.totalCost - penalty;

    set({
      reservations: reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'cancelled', cancelledAt: new Date().toISOString(), penalty } : r
      ),
      currentUser: { ...currentUser, balance: currentUser.balance + refund },
    });
  },

  markNotificationRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
  },

  addTransaction: (t) => {
    const newTxn: Transaction = { ...t, id: `txn-${Date.now()}`, createdAt: new Date().toISOString() };
    set(state => ({ transactions: [newTxn, ...state.transactions] }));
  },
}));
