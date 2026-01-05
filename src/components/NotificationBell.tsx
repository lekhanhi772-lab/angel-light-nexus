import { useState } from 'react';
import { Bell, X, Sparkles } from 'lucide-react';
import { useReferral } from '@/hooks/useReferral';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NotificationBellProps {
  userId: string | undefined;
}

export const NotificationBell = ({ userId }: NotificationBellProps) => {
  const { notifications, markNotificationRead } = useReferral(userId);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.length;

  if (!userId) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button 
          className="relative p-2 rounded-full transition-all hover:bg-[rgba(218,165,32,0.1)]"
          style={{ color: '#DAA520' }}
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)',
                boxShadow: '0 2px 8px rgba(255, 75, 87, 0.4)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0"
        style={{
          background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 100%)',
          border: '2px solid #DAA520',
          boxShadow: '0 10px 40px rgba(218, 165, 32, 0.2)',
        }}
      >
        <div 
          className="p-4 border-b flex items-center gap-2"
          style={{ borderColor: 'rgba(218, 165, 32, 0.3)' }}
        >
          <Sparkles className="w-5 h-5" style={{ color: '#DAA520' }} />
          <h3 className="font-bold" style={{ color: '#B8860B' }}>
            Thông Báo Ánh Sáng
          </h3>
        </div>

        <ScrollArea className="max-h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm" style={{ color: '#8B6914' }}>
                Chưa có thông báo mới 💛
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 rounded-xl relative group"
                  style={{
                    background: 'rgba(218, 165, 32, 0.08)',
                    border: '1px solid rgba(218, 165, 32, 0.2)',
                  }}
                >
                  <button
                    onClick={() => markNotificationRead(notif.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-[rgba(218,165,32,0.2)]"
                    style={{ color: '#8B6914' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <h4 
                    className="text-sm font-medium mb-1 pr-6"
                    style={{ color: '#B8860B' }}
                  >
                    {notif.title}
                  </h4>
                  <p 
                    className="text-xs"
                    style={{ color: '#8B6914' }}
                  >
                    {notif.message}
                  </p>
                  <p 
                    className="text-xs mt-2 opacity-60"
                    style={{ color: '#A0855B' }}
                  >
                    {new Date(notif.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
