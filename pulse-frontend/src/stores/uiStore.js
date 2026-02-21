import { create } from 'zustand';

export const useUIStore = create((set, get) => ({
  activeModal: null,
  modalData: null,
  toastQueue: [],
  connectionStatus: 'disconnected', // 'connected', 'connecting', 'disconnected'
  sidebarCollapsed: false,
  rightPanelTab: 'alerts', // 'alerts', 'triage', 'chat'

  // Modal management
  openModal: (modalType, data = null) => {
    set({ activeModal: modalType, modalData: data });
  },

  closeModal: () => {
    set({ activeModal: null, modalData: null });
  },

  // Toast notifications
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: toast.type || 'info', // 'success', 'error', 'warning', 'info'
      message: toast.message,
      title: toast.title,
      duration: toast.duration || 5000,
    };
    set((state) => ({
      toastQueue: [...state.toastQueue, newToast],
    }));
    
    // Auto-remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
    
    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toastQueue: state.toastQueue.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toastQueue: [] });
  },

  // Connection status
  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },

  // Sidebar
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
  },

  // Right panel tabs
  setRightPanelTab: (tab) => {
    set({ rightPanelTab: tab });
  },

  // Convenience methods
  showSuccess: (message, title = 'Success') => {
    return get().addToast({ type: 'success', message, title });
  },

  showError: (message, title = 'Error') => {
    return get().addToast({ type: 'error', message, title, duration: 8000 });
  },

  showWarning: (message, title = 'Warning') => {
    return get().addToast({ type: 'warning', message, title });
  },

  showInfo: (message, title = 'Info') => {
    return get().addToast({ type: 'info', message, title });
  },
}));
