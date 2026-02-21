import { create } from 'zustand';

export const useEmergencyStore = create((set, get) => ({
  activeEmergencies: [],
  selectedEmergencyId: null,
  filters: {
    priority: null, // P1, P2, P3, P4
    status: null, // ACTIVE, EN_ROUTE, RESOLVED
    timeRange: 'today',
  },

  setEmergencies: (emergencies) => {
    set({ activeEmergencies: emergencies });
  },

  addEmergency: (emergency) => {
    set((state) => ({
      activeEmergencies: [emergency, ...state.activeEmergencies],
    }));
  },

  updateEmergency: (id, updates) => {
    set((state) => ({
      activeEmergencies: state.activeEmergencies.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  },

  removeEmergency: (id) => {
    set((state) => ({
      activeEmergencies: state.activeEmergencies.filter((e) => e.id !== id),
      selectedEmergencyId:
        state.selectedEmergencyId === id ? null : state.selectedEmergencyId,
    }));
  },

  selectEmergency: (id) => {
    set({ selectedEmergencyId: id });
  },

  clearSelection: () => {
    set({ selectedEmergencyId: null });
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        priority: null,
        status: null,
        timeRange: 'today',
      },
    });
  },

  getSelectedEmergency: () => {
    const { activeEmergencies, selectedEmergencyId } = get();
    return activeEmergencies.find((e) => e.id === selectedEmergencyId) || null;
  },

  getFilteredEmergencies: () => {
    const { activeEmergencies, filters } = get();
    return activeEmergencies.filter((e) => {
      if (filters.priority && e.priority !== filters.priority) return false;
      if (filters.status && e.status !== filters.status) return false;
      return true;
    });
  },

  getEmergenciesByPriority: () => {
    const { activeEmergencies } = get();
    return {
      P1: activeEmergencies.filter((e) => e.priority === 'P1').length,
      P2: activeEmergencies.filter((e) => e.priority === 'P2').length,
      P3: activeEmergencies.filter((e) => e.priority === 'P3').length,
      P4: activeEmergencies.filter((e) => e.priority === 'P4').length,
    };
  },
}));
