import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  // État
  notifications: [],

  // Actions
  addNotification: (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info', // 'success', 'error', 'warning', 'info'
      title: '',
      message: '',
      duration: 5000,
      ...notification,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },

  clearAllNotifications: () => {
    set({ notifications: [] });
  },

  // Helpers
  showSuccess: (message, title = 'Succès') => {
    return get().addNotification({
      type: 'success',
      title,
      message
    });
  },

  showError: (message, title = 'Erreur') => {
    return get().addNotification({
      type: 'error',
      title,
      message
    });
  },

  showWarning: (message, title = 'Attention') => {
    return get().addNotification({
      type: 'warning',
      title,
      message
    });
  },

  showInfo: (message, title = 'Information') => {
    return get().addNotification({
      type: 'info',
      title,
      message
    });
  },

  // Getters
  getNotifications: () => get().notifications,
  getNotificationCount: () => get().notifications.length,
})); 