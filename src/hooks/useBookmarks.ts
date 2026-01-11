import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Bookmark {
  id: string;
  message_id: string | null;
  content: string;
  note: string | null;
  created_at: string;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setBookmarkedIds(new Set());
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookmarked_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBookmarks(data || []);
      setBookmarkedIds(new Set(data?.map(b => b.message_id).filter(Boolean) as string[]));
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const addBookmark = async (messageId: string | null, content: string, note?: string) => {
    if (!user) {
      toast.error('Đăng nhập để lưu bookmark nhé ✨');
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('bookmarked_messages')
        .insert({
          user_id: user.id,
          message_id: messageId,
          content,
          note: note || null,
        })
        .select()
        .single();

      if (error) throw error;

      setBookmarks(prev => [data, ...prev]);
      if (messageId) {
        setBookmarkedIds(prev => new Set([...prev, messageId]));
      }
      toast.success('Đã lưu vào bookmark! ⭐');
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast.error('Không thể lưu bookmark');
      return false;
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    if (!user) return false;

    try {
      const bookmark = bookmarks.find(b => b.id === bookmarkId);
      
      const { error } = await supabase
        .from('bookmarked_messages')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', user.id);

      if (error) throw error;

      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      if (bookmark?.message_id) {
        setBookmarkedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(bookmark.message_id!);
          return newSet;
        });
      }
      toast.success('Đã xóa bookmark!');
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Không thể xóa bookmark');
      return false;
    }
  };

  const updateBookmarkNote = async (bookmarkId: string, note: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('bookmarked_messages')
        .update({ note })
        .eq('id', bookmarkId)
        .eq('user_id', user.id);

      if (error) throw error;

      setBookmarks(prev => prev.map(b => 
        b.id === bookmarkId ? { ...b, note } : b
      ));
      toast.success('Đã cập nhật ghi chú!');
      return true;
    } catch (error) {
      console.error('Error updating bookmark note:', error);
      toast.error('Không thể cập nhật ghi chú');
      return false;
    }
  };

  const isBookmarked = (messageId: string) => bookmarkedIds.has(messageId);

  const toggleBookmark = async (messageId: string | null, content: string) => {
    if (messageId && isBookmarked(messageId)) {
      const bookmark = bookmarks.find(b => b.message_id === messageId);
      if (bookmark) {
        return removeBookmark(bookmark.id);
      }
    }
    return addBookmark(messageId, content);
  };

  return {
    bookmarks,
    bookmarkedIds,
    loading,
    addBookmark,
    removeBookmark,
    updateBookmarkNote,
    isBookmarked,
    toggleBookmark,
    refetch: fetchBookmarks,
  };
};
