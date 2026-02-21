import { create } from 'zustand';

export const useAmbulanceStore = create((set, get) => ({
  ambulances: {},
  lastPositionUpdate: null,

  setAmbulances: (ambulances) => {
    const ambulanceMap = {};
    ambulances.forEach((a) => {
      ambulanceMap[a.id] = a;
    });
    set({
      ambulances: ambulanceMap,
      lastPositionUpdate: new Date().toISOString(),
    });
  },

  updateAmbulance: (id, updates) => {
    set((state) => ({
      ambulances: {
        ...state.ambulances,
        [id]: {
          ...state.ambulances[id],
          ...updates,
        },
      },
      lastPositionUpdate: new Date().toISOString(),
    }));
  },

  updateAmbulancePosition: (id, lat, lng, heading) => {
    set((state) => ({
      ambulances: {
        ...state.ambulances,
        [id]: {
          ...state.ambulances[id],
          location: { lat, lng },
          heading,
          lastUpdate: new Date().toISOString(),
        },
      },
      lastPositionUpdate: new Date().toISOString(),
    }));
  },

  removeAmbulance: (id) => {
    set((state) => {
      const { [id]: removed, ...rest } = state.ambulances;
      return { ambulances: rest };
    });
  },

  getAmbulanceById: (id) => {
    return get().ambulances[id] || null;
  },

  getAmbulanceList: () => {
    return Object.values(get().ambulances);
  },

  getAmbulancesByStatus: (status) => {
    return Object.values(get().ambulances).filter((a) => a.status === status);
  },

  getEnRouteAmbulances: () => {
    return Object.values(get().ambulances).filter(
      (a) => a.status === 'EN_ROUTE' || a.status === 'DISPATCHED'
    );
  },

  getAvailableAmbulances: () => {
    return Object.values(get().ambulances).filter(
      (a) => a.status === 'AVAILABLE'
    );
  },
}));
