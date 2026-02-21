import { create } from 'zustand';

export const useHospitalStore = create((set, get) => ({
  hospitals: {},
  selectedHospitalId: null,
  capacitySummary: {
    totalBeds: 0,
    availableBeds: 0,
    icuAvailable: 0,
    traumaAvailable: 0,
  },

  setHospitals: (hospitals) => {
    const hospitalMap = {};
    hospitals.forEach((h) => {
      hospitalMap[h.id] = h;
    });
    set({ hospitals: hospitalMap });
    get().updateCapacitySummary();
  },

  updateHospital: (id, updates) => {
    set((state) => ({
      hospitals: {
        ...state.hospitals,
        [id]: {
          ...state.hospitals[id],
          ...updates,
          lastUpdated: new Date().toISOString(),
        },
      },
    }));
    get().updateCapacitySummary();
  },

  updateHospitalCapacity: (id, capacity) => {
    set((state) => ({
      hospitals: {
        ...state.hospitals,
        [id]: {
          ...state.hospitals[id],
          capacity: {
            ...state.hospitals[id]?.capacity,
            ...capacity,
          },
          lastUpdated: new Date().toISOString(),
        },
      },
    }));
    get().updateCapacitySummary();
  },

  selectHospital: (id) => {
    set({ selectedHospitalId: id });
  },

  clearSelection: () => {
    set({ selectedHospitalId: null });
  },

  getHospitalById: (id) => {
    return get().hospitals[id] || null;
  },

  getHospitalList: () => {
    return Object.values(get().hospitals);
  },

  getSelectedHospital: () => {
    const { hospitals, selectedHospitalId } = get();
    return hospitals[selectedHospitalId] || null;
  },

  getHospitalsWithAvailableBeds: () => {
    return Object.values(get().hospitals).filter(
      (h) => h.capacity && h.capacity.availableBeds > 0
    );
  },

  getHospitalsSortedByCapacity: () => {
    return Object.values(get().hospitals).sort((a, b) => {
      const aAvailable = a.capacity?.availableBeds || 0;
      const bAvailable = b.capacity?.availableBeds || 0;
      return bAvailable - aAvailable;
    });
  },

  updateCapacitySummary: () => {
    const hospitals = Object.values(get().hospitals);
    const summary = hospitals.reduce(
      (acc, h) => {
        if (h.capacity) {
          acc.totalBeds += h.capacity.totalBeds || 0;
          acc.availableBeds += h.capacity.availableBeds || 0;
          acc.icuAvailable += h.capacity.icuAvailable || 0;
          acc.traumaAvailable += h.capacity.traumaAvailable || 0;
        }
        return acc;
      },
      { totalBeds: 0, availableBeds: 0, icuAvailable: 0, traumaAvailable: 0 }
    );
    set({ capacitySummary: summary });
  },
}));
