import { useState } from 'react';
import { Bookmark, Trash2, Edit3, Check, X, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useBookmarks } from '@/hooks/useBookmarks';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface BookmarksPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookmarksPanel = ({ isOpen, onClose }: BookmarksPanelProps) => {
  const { t } = useTranslation();
  const { bookmarks, loading, removeBookmark, updateBookmarkNote } = useBookmarks();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');

  const filteredBookmarks = bookmarks.filter(b => 
    b.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.note?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (bookmark: { id: string; note: string | null }) => {
    setEditingId(bookmark.id);
    setEditNote(bookmark.note || '');
  };

  const handleSaveNote = async (id: string) => {
    await updateBookmarkNote(id, editNote);
    setEditingId(null);
    setEditNote('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-black/30"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[65] h-screen w-[90vw] max-w-md transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 100%)',
          borderLeft: '2px solid #DAA520',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'rgba(218, 165, 32, 0.3)' }}
        >
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" style={{ color: '#DAA520' }} />
            <h2 
              className="text-lg font-bold"
              style={{ color: '#B8860B' }}
            >
              {t('bookmarks.title', 'Saved Messages')}
            </h2>
            <span 
              className="text-sm px-2 py-0.5 rounded-full"
              style={{ 
                background: 'rgba(218, 165, 32, 0.2)',
                color: '#B8860B' 
              }}
            >
              {bookmarks.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[#FFFACD]"
            style={{ color: '#B8860B' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: '#B8860B' }}
            />
            <Input
              placeholder={t('bookmarks.search', 'Search bookmarks...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              style={{
                background: 'rgba(255, 251, 230, 0.8)',
                border: '1px solid rgba(218, 165, 32, 0.3)',
              }}
            />
          </div>
        </div>

        {/* Bookmarks List */}
        <ScrollArea className="h-[calc(100vh-140px)] px-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-3 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: '#DAA520' }} />
              <p style={{ color: '#8B6914' }}>
                {searchQuery 
                  ? t('bookmarks.no_results', 'No bookmarks found')
                  : t('bookmarks.empty', 'No saved messages yet')}
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {filteredBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 251, 230, 0.9) 100%)',
                    border: '1px solid rgba(218, 165, 32, 0.3)',
                  }}
                >
                  {/* Content */}
                  <p 
                    className="text-sm mb-3 line-clamp-4"
                    style={{ color: '#5C4033' }}
                  >
                    {bookmark.content}
                  </p>

                  {/* Note */}
                  {editingId === bookmark.id ? (
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder={t('bookmarks.add_note', 'Add a note...')}
                        className="flex-1 text-sm"
                        style={{
                          background: 'white',
                          border: '1px solid rgba(218, 165, 32, 0.5)',
                        }}
                      />
                      <button
                        onClick={() => handleSaveNote(bookmark.id)}
                        className="p-2 rounded-lg"
                        style={{ background: 'rgba(218, 165, 32, 0.2)', color: '#B8860B' }}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-lg hover:bg-gray-100"
                        style={{ color: '#8B6914' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : bookmark.note ? (
                    <p 
                      className="text-xs italic mb-3 p-2 rounded-lg"
                      style={{ 
                        background: 'rgba(218, 165, 32, 0.1)',
                        color: '#8B6914' 
                      }}
                    >
                      📝 {bookmark.note}
                    </p>
                  ) : null}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xs"
                      style={{ color: '#8B6914' }}
                    >
                      {new Date(bookmark.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(bookmark)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-[#FFFACD]"
                        style={{ color: '#B8860B' }}
                        title={t('bookmarks.edit_note', 'Edit note')}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeBookmark(bookmark.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: '#dc2626' }}
                        title={t('bookmarks.delete', 'Delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </>
  );
};

export default BookmarksPanel;
