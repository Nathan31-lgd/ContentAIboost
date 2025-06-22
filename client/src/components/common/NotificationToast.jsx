import React from 'react';
import { Toast } from '@shopify/polaris';

const NotificationToast = ({ notification, onDismiss }) => {
  if (!notification) return null;

  const getToastProps = () => {
    switch (notification.type) {
      case 'success':
        return { content: notification.message };
      case 'error':
        return { content: notification.message, error: true };
      case 'warning':
        return { content: notification.message, error: true };
      default:
        return { content: notification.message };
    }
  };

  return (
    <Toast
      {...getToastProps()}
      onDismiss={onDismiss}
      duration={notification.duration || 5000}
    />
  );
};

export default NotificationToast; 