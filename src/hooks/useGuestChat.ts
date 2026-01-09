const STORAGE_KEY = 'guest_chat_messages';
const MAX_MESSAGES = 100;

export interface GuestMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: number;
}

export const useGuestChat = () => {
  const saveGuestMessage = (message: Omit<GuestMessage, 'timestamp'>) => {
    try {
      const existing = getGuestMessages();
      const newMessage: GuestMessage = {
        ...message,
        timestamp: Date.now()
      };
      
      // Keep only last MAX_MESSAGES
      const updated = [...existing, newMessage].slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[useGuestChat] Error saving guest message:', error);
    }
  };

  const getGuestMessages = (): GuestMessage[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as GuestMessage[];
    } catch (error) {
      console.error('[useGuestChat] Error reading guest messages:', error);
      return [];
    }
  };

  const clearGuestMessages = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[useGuestChat] Error clearing guest messages:', error);
    }
  };

  const hasGuestMessages = (): boolean => {
    return getGuestMessages().length > 0;
  };

  return {
    saveGuestMessage,
    getGuestMessages,
    clearGuestMessages,
    hasGuestMessages
  };
};
