import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('guest');
  const [profile, setProfile] = useState(null);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      setRole('guest');
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const resolvedProfile = data || null;
    setProfile(resolvedProfile);
    setRole(resolvedProfile?.role || 'student');
    return resolvedProfile;
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      try {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await fetchProfile(currentUser?.id);
      } catch (err) {
        console.error('Failed to load session profile:', err);
      } finally {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        await fetchProfile(currentUser?.id);
      } catch (err) {
        console.error('Failed to update auth state:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signup = async (email, password, profileData) => {
    const {
      username = '',
      fullName = '',
      phone = '',
      avatarUrl = '',
      socialLinks = { linkedin: '', github: '', linktree: '' },
    } = profileData || {};

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          phone,
          avatar_url: avatarUrl,
          social_links: socialLinks,
        },
      },
    });
    if (error) throw error;

    if (data?.user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          username,
          full_name: fullName,
          phone,
          avatar_url: avatarUrl,
          social_links: socialLinks,
          role: 'student',
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;
    }

    return data;
  };

  const refreshProfile = async () => {
    if (!user?.id) return null;
    return fetchProfile(user.id);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;

    // Ensure UI state resets immediately even if auth event propagation is delayed.
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole('guest');
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/student-zone`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, role, profile, login, signup, logout, resetPassword, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
