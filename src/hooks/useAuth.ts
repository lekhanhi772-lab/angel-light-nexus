import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  wallet_address: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Defer profile fetch with setTimeout to prevent deadlock
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (authUser: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    // If profile exists, use it
    if (!error && data) {
      setProfile(data);
      return;
    }

    // If no profile row yet, create it so UI can show logged-in state reliably
    // (Many new users won't have a profiles row initially.)
    const noRow = (error as any)?.code === 'PGRST116';
    if (noRow) {
      const display_name =
        (authUser.user_metadata as any)?.full_name ??
        (authUser.user_metadata as any)?.name ??
        null;
      const avatar_url = (authUser.user_metadata as any)?.avatar_url ?? null;
      const email = authUser.email ?? null;

      const { data: created, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: authUser.id,
          display_name,
          avatar_url,
          email,
        })
        .select('*')
        .single();

      if (!insertError && created) {
        setProfile(created);
        return;
      }
    }

    // Fallback: allow app to still treat user as logged in even if profile fetch/create fails
    setProfile(null);
  };

  const signInWithGoogle = async () => {
    // Use the current origin so auth works in preview + production domains
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signInWithGoogle,
    signOut,
  };
};
