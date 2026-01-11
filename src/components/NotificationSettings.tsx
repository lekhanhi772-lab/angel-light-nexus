import { Bell, BellOff, Volume2, VolumeX, Users, Settings2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useTranslation } from 'react-i18next';

const NotificationSettings = () => {
  const { t } = useTranslation();
  const {
    isSupported,
    permission,
    settings,
    updateSettings,
    requestPermission,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div 
        className="p-4 rounded-xl text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.95) 100%)',
          border: '1px solid rgba(218, 165, 32, 0.3)',
        }}
      >
        <BellOff className="w-8 h-8 mx-auto mb-2 opacity-50" style={{ color: '#B8860B' }} />
        <p className="text-sm" style={{ color: '#8B6914' }}>
          {t('notifications.not_supported', 'Browser does not support notifications')}
        </p>
      </div>
    );
  }

  const handleEnableNotifications = async () => {
    if (permission === 'default') {
      await requestPermission();
    } else if (permission === 'granted') {
      updateSettings({ enabled: !settings.enabled });
    }
  };

  return (
    <div 
      className="p-6 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)',
        border: '1px solid rgba(218, 165, 32, 0.3)',
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Settings2 className="w-5 h-5" style={{ color: '#DAA520' }} />
        <h3 className="text-lg font-bold" style={{ color: '#B8860B' }}>
          {t('notifications.settings_title', 'Notification Settings')}
        </h3>
      </div>

      <div className="space-y-4">
        {/* Master Toggle */}
        <div 
          className="flex items-center justify-between p-4 rounded-xl"
          style={{
            background: settings.enabled 
              ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%)'
              : 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(218, 165, 32, 0.2)',
          }}
        >
          <div className="flex items-center gap-3">
            {settings.enabled ? (
              <Bell className="w-5 h-5" style={{ color: '#DAA520' }} />
            ) : (
              <BellOff className="w-5 h-5" style={{ color: '#8B6914' }} />
            )}
            <div>
              <p className="font-medium" style={{ color: '#B8860B' }}>
                {t('notifications.enable', 'Enable Notifications')}
              </p>
              <p className="text-xs" style={{ color: '#8B6914' }}>
                {permission === 'denied' 
                  ? t('notifications.blocked', 'Notifications are blocked in browser settings')
                  : permission === 'default'
                    ? t('notifications.request', 'Click to request permission')
                    : settings.enabled 
                      ? t('notifications.enabled', 'You will receive notifications')
                      : t('notifications.disabled', 'Notifications are turned off')}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.enabled && permission === 'granted'}
            onCheckedChange={handleEnableNotifications}
            disabled={permission === 'denied'}
          />
        </div>

        {/* Forum Notifications */}
        <div 
          className="flex items-center justify-between p-4 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(218, 165, 32, 0.15)',
            opacity: settings.enabled ? 1 : 0.5,
          }}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" style={{ color: '#B8860B' }} />
            <div>
              <p className="font-medium" style={{ color: '#B8860B' }}>
                {t('notifications.forum', 'Forum Activity')}
              </p>
              <p className="text-xs" style={{ color: '#8B6914' }}>
                {t('notifications.forum_desc', 'New posts and comments')}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.forum}
            onCheckedChange={(checked) => updateSettings({ forum: checked })}
            disabled={!settings.enabled}
          />
        </div>

        {/* System Notifications */}
        <div 
          className="flex items-center justify-between p-4 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(218, 165, 32, 0.15)',
            opacity: settings.enabled ? 1 : 0.5,
          }}
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" style={{ color: '#B8860B' }} />
            <div>
              <p className="font-medium" style={{ color: '#B8860B' }}>
                {t('notifications.system', 'System Notifications')}
              </p>
              <p className="text-xs" style={{ color: '#8B6914' }}>
                {t('notifications.system_desc', 'Updates and announcements')}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.system}
            onCheckedChange={(checked) => updateSettings({ system: checked })}
            disabled={!settings.enabled}
          />
        </div>

        {/* Sound Toggle */}
        <div 
          className="flex items-center justify-between p-4 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(218, 165, 32, 0.15)',
            opacity: settings.enabled ? 1 : 0.5,
          }}
        >
          <div className="flex items-center gap-3">
            {settings.sound ? (
              <Volume2 className="w-5 h-5" style={{ color: '#B8860B' }} />
            ) : (
              <VolumeX className="w-5 h-5" style={{ color: '#8B6914' }} />
            )}
            <div>
              <p className="font-medium" style={{ color: '#B8860B' }}>
                {t('notifications.sound', 'Notification Sound')}
              </p>
              <p className="text-xs" style={{ color: '#8B6914' }}>
                {t('notifications.sound_desc', 'Play sound for notifications')}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.sound}
            onCheckedChange={(checked) => updateSettings({ sound: checked })}
            disabled={!settings.enabled}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
