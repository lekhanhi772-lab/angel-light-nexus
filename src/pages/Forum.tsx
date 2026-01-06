import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Loader2, Users } from 'lucide-react';
import { useForum, ForumPost } from '@/hooks/useForum';
import { useAuth } from '@/hooks/useAuth';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { CreatePostDialog } from '@/components/forum/CreatePostDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Forum() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    categories,
    posts,
    loading,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    toggleLike
  } = useForum();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<ForumPost | null>(null);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      fetchPosts();
    } else {
      fetchPosts(categoryId);
    }
  };

  const handleEditPost = (post: ForumPost) => {
    setEditingPost(post);
    setShowCreateDialog(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setShowCreateDialog(open);
    if (!open) {
      setEditingPost(null);
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-4 md:px-8"
      style={{
        background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 50%, #FFFBE6 100%)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-10 h-10" style={{ color: '#DAA520' }} />
            <h1
              className="text-3xl md:text-4xl font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#8B6914',
              }}
            >
              {t('forum.title')}
            </h1>
          </div>
          <p className="text-lg" style={{ color: '#8B7355' }}>
            {t('forum.subtitle')}
          </p>
        </div>

        {/* Category tabs + Create button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <Tabs value={selectedCategory} onValueChange={handleCategoryChange}>
            <TabsList
              className="flex-wrap h-auto gap-1 p-1"
              style={{
                background: 'rgba(255, 250, 205, 0.7)',
                border: '1px solid rgba(218, 165, 32, 0.3)',
              }}
            >
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-[#DAA520] data-[state=active]:text-white"
              >
                {t('forum.all_posts')}
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="data-[state=active]:bg-[#DAA520] data-[state=active]:text-white"
                >
                  <span className="mr-1">{cat.icon}</span>
                  <span className="hidden sm:inline">{cat.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {user && (
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('forum.create_post')}
            </Button>
          )}
        </div>

        {/* Posts grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#DAA520' }} />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid gap-4">
            {posts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                onLike={toggleLike}
                onDelete={deletePost}
                onEdit={handleEditPost}
              />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 rounded-2xl"
            style={{
              background: 'rgba(255, 251, 230, 0.8)',
              border: '1px dashed rgba(218, 165, 32, 0.4)',
            }}
          >
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#DAA520', opacity: 0.5 }} />
            <p className="text-lg font-medium mb-2" style={{ color: '#8B6914' }}>
              {t('forum.no_posts')}
            </p>
            <p className="text-sm mb-4" style={{ color: '#8B7355' }}>
              {t('forum.be_first')}
            </p>
            {user && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="text-white"
                style={{
                  background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('forum.create_post')}
              </Button>
            )}
          </div>
        )}

        {/* Login prompt for guests */}
        {!user && (
          <div
            className="mt-8 text-center py-6 rounded-2xl"
            style={{
              background: 'rgba(255, 251, 230, 0.8)',
              border: '1px solid rgba(218, 165, 32, 0.3)',
            }}
          >
            <p className="text-sm" style={{ color: '#8B7355' }}>
              {t('forum.login_to_post')}
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit post dialog */}
      <CreatePostDialog
        open={showCreateDialog}
        onOpenChange={handleCloseDialog}
        categories={categories}
        onSubmit={createPost}
        editingPost={editingPost}
        onUpdate={updatePost}
      />
    </div>
  );
}
