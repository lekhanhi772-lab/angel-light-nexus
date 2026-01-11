import { useState, useEffect, useCallback } from 'react';

export interface PushNotificationSettings {
  enabled: boolean;
  forum: boolean;
  system: boolean;
  sound: boolean;
}

const DEFAULT_SETTINGS: PushNotificationSettings = {
  enabled: false,
  forum: true,
  system: true,
  sound: true,
};

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [settings, setSettings] = useState<PushNotificationSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('push_notification_settings');
      if (saved) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        } catch {
          return DEFAULT_SETTINGS;
        }
      }
    }
    return DEFAULT_SETTINGS;
  });

  const isSupported = typeof window !== 'undefined' && 'Notification' in window;

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('push_notification_settings', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        updateSettings({ enabled: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const updateSettings = useCallback((updates: Partial<PushNotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const sendNotification = useCallback((
    title: string, 
    options?: NotificationOptions & { type?: 'forum' | 'system' }
  ) => {
    if (!isSupported || permission !== 'granted' || !settings.enabled) {
      return null;
    }

    // Check if this type of notification is enabled
    const notificationType = options?.type || 'system';
    if (notificationType === 'forum' && !settings.forum) return null;
    if (notificationType === 'system' && !settings.system) return null;

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      // Play sound if enabled
      if (settings.sound) {
        // You could add a notification sound here
        // const audio = new Audio('/notification-sound.mp3');
        // audio.play().catch(() => {});
      }

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }, [isSupported, permission, settings]);

  const notifyForumActivity = useCallback((title: string, body: string) => {
    return sendNotification(title, { body, type: 'forum', tag: 'forum' });
  }, [sendNotification]);

  const notifySystem = useCallback((title: string, body: string) => {
    return sendNotification(title, { body, type: 'system', tag: 'system' });
  }, [sendNotification]);

  return {
    isSupported,
    permission,
    settings,
    updateSettings,
    requestPermission,
    sendNotification,
    notifyForumActivity,
    notifySystem,
  };
};
