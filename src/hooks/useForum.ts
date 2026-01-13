import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ForumCategory {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface ForumPost {
  id: string;
  author_id: string;
  category_id: string | null;
  title: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    display_name: string | null;
    avatar_url: string | null;
    wallet_address?: string | null;
  };
  category?: {
    name: string;
    icon: string;
  };
  is_liked?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  replies?: ForumComment[];
}

export function useForum() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    }
  }, []);

  // Fetch posts with author info
  const fetchPosts = useCallback(async (categoryId?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('forum_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: postsData, error: postsError } = await query;
      
      if (postsError) throw postsError;

      // Fetch authors and categories separately
      const authorIds = [...new Set((postsData || []).map(p => p.author_id))];
      const categoryIds = [...new Set((postsData || []).filter(p => p.category_id).map(p => p.category_id))];

      const [{ data: profiles }, { data: categories }] = await Promise.all([
        supabase.from('profiles').select('user_id, display_name, avatar_url, wallet_address').in('user_id', authorIds),
        categoryIds.length > 0 
          ? supabase.from('forum_categories').select('id, name, icon').in('id', categoryIds)
          : { data: [] }
      ]);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const categoryMap = new Map((categories || []).map(c => [c.id, c]));

      // Check which posts the user has liked
      let likedPostIds: string[] = [];
      if (user) {
        const { data: likes } = await supabase
          .from('forum_likes')
          .select('post_id')
          .eq('user_id', user.id);
        
        likedPostIds = (likes || []).map(l => l.post_id);
      }

      const postsWithDetails: ForumPost[] = (postsData || []).map(post => {
        const profile = profileMap.get(post.author_id);
        const category = post.category_id ? categoryMap.get(post.category_id) : null;
        return {
          ...post,
          author: profile ? { display_name: profile.display_name, avatar_url: profile.avatar_url, wallet_address: profile.wallet_address } : { display_name: null, avatar_url: null, wallet_address: null },
          category: category ? { name: category.name, icon: category.icon } : undefined,
          is_liked: likedPostIds.includes(post.id)
        };
      });

      setPosts(postsWithDetails);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Upload image to storage
  const uploadImage = useCallback(async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('forum-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('forum-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (err: any) {
      console.error('Error uploading image:', err);
      return null;
    }
  }, []);

  // Create a new post
  const createPost = useCallback(async (
    title: string,
    content: string,
    categoryId?: string,
    imageFile?: File
  ): Promise<ForumPost | null> => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để đăng bài');
      return null;
    }

    try {
      let imageUrl: string | null = null;

      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, user.id);
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          author_id: user.id,
          category_id: categoryId || null,
          title,
          content,
          image_url: imageUrl
        })
        .select()
        .single();

      if (error) throw error;
      
      // Award points for forum post
      try {
        await supabase.rpc('award_activity_points', {
          p_user_id: user.id,
          p_activity_type: 'forum_post',
          p_points: 10,
          p_metadata: { post_id: data.id }
        });
        toast.success('Đăng bài thành công! +10 điểm Ánh Sáng ✨');
      } catch (rewardErr) {
        console.error('Reward error:', rewardErr);
        toast.success('Đăng bài thành công! ✨');
      }
      
      await fetchPosts();
      return data;
    } catch (err: any) {
      console.error('Error creating post:', err);
      toast.error('Có lỗi khi đăng bài: ' + err.message);
      return null;
    }
  }, [user, fetchPosts, uploadImage]);

  // Update a post
  const updatePost = useCallback(async (
    postId: string,
    title: string,
    content: string,
    categoryId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({
          title,
          content,
          category_id: categoryId || null
        })
        .eq('id', postId)
        .eq('author_id', user.id);

      if (error) throw error;
      
      toast.success('Cập nhật bài viết thành công!');
      await fetchPosts();
      return true;
    } catch (err: any) {
      console.error('Error updating post:', err);
      toast.error('Có lỗi khi cập nhật: ' + err.message);
      return false;
    }
  }, [user, fetchPosts]);

  // Delete a post
  const deletePost = useCallback(async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      toast.success('Đã xóa bài viết');
      await fetchPosts();
      return true;
    } catch (err: any) {
      console.error('Error deleting post:', err);
      toast.error('Có lỗi khi xóa: ' + err.message);
      return false;
    }
  }, [user, fetchPosts]);

  // Toggle like on a post
  const toggleLike = useCallback(async (postId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để thích bài viết');
      return false;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return false;

      if (post.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('forum_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('forum_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) throw error;
      }

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1
            }
          : p
      ));

      return true;
    } catch (err: any) {
      console.error('Error toggling like:', err);
      toast.error('Có lỗi xảy ra');
      return false;
    }
  }, [user, posts]);

  // Fetch comments for a post
  const fetchComments = useCallback(async (postId: string): Promise<ForumComment[]> => {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch authors
      const authorIds = [...new Set((data || []).map(c => c.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', authorIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      // Organize into tree structure
      const comments: ForumComment[] = (data || []).map(c => {
        const profile = profileMap.get(c.author_id);
        return {
          ...c,
          author: profile ? { display_name: profile.display_name, avatar_url: profile.avatar_url } : { display_name: null, avatar_url: null },
          replies: []
        };
      });

      const rootComments: ForumComment[] = [];
      const commentMap = new Map<string, ForumComment>();

      comments.forEach(c => commentMap.set(c.id, c));
      
      comments.forEach(c => {
        if (c.parent_id && commentMap.has(c.parent_id)) {
          const parent = commentMap.get(c.parent_id)!;
          if (!parent.replies) parent.replies = [];
          parent.replies.push(c);
        } else {
          rootComments.push(c);
        }
      });

      return rootComments;
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      return [];
    }
  }, []);

  // Create a comment
  const createComment = useCallback(async (
    postId: string,
    content: string,
    parentId?: string
  ): Promise<ForumComment | null> => {
    if (!user) {
      toast.error('Bạn cần đăng nhập để bình luận');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          parent_id: parentId || null,
          content
        })
        .select('*')
        .single();

      if (error) throw error;

      // Award points for comment
      try {
        await supabase.rpc('award_activity_points', {
          p_user_id: user.id,
          p_activity_type: 'forum_comment',
          p_points: 3,
          p_metadata: { comment_id: data.id }
        });
      } catch (rewardErr) {
        console.error('Comment reward error:', rewardErr);
      }

      // Fetch author profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();
      
      // Update comments count in local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ));

      return {
        ...data,
        author: profile || { display_name: null, avatar_url: null }
      };
    } catch (err: any) {
      console.error('Error creating comment:', err);
      toast.error('Có lỗi khi bình luận: ' + err.message);
      return null;
    }
  }, [user]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string, postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('forum_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      
      // Update comments count in local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, comments_count: Math.max(0, p.comments_count - 1) }
          : p
      ));

      toast.success('Đã xóa bình luận');
      return true;
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      toast.error('Có lỗi khi xóa: ' + err.message);
      return false;
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('forum-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forum_posts' },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  return {
    categories,
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    fetchComments,
    createComment,
    deleteComment
  };
}
