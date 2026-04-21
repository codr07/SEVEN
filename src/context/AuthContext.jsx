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
      console.warn('fetchProfile error:', error);
      return null;
    }

    const resolvedProfile = data || null;
    setProfile(resolvedProfile);
    setRole(resolvedProfile?.role || 'student');
    return resolvedProfile;
  };

let globalSessionPromise = null;

  useEffect(() => {
    let mounted = true;

    const handleSessionLoad = async (session) => {
      try {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          let resolvedProfile = await fetchProfile(currentUser.id);
          
          if (!resolvedProfile) {
            // Attempt to create the profile from user metadata if it's missing (fallback if trigger/signup insert failed)
            const meta = currentUser.user_metadata || {};
            const { error: createError } = await supabase.from('profiles').insert({
              id: currentUser.id,
              username: meta.username || '',
              full_name: meta.full_name || '',
              phone: meta.phone || '',
              avatar_url: meta.avatar_url || '',
              social_links: meta.social_links || { linkedin: '', github: '', linktree: '' },
              role: 'student',
              updated_at: new Date().toISOString(),
            });
            if (!createError) {
              resolvedProfile = await fetchProfile(currentUser.id);
            } else {
              console.warn('Fallback profile creation failed:', createError.message);
            }
          }
        } else {
          setProfile(null);
          setRole('guest');
        }
      } catch (err) {
        console.error('Failed to load session profile, possible corrupted JWT:', err);
        // If the server rejects the JWT (e.g. PGRST301) or any fatal profile error occurs,
        // we MUST purge the corrupted local session so public queries don't continue to fail!
        await supabase.auth.signOut().catch(() => {});
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole('guest');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!globalSessionPromise) {
      globalSessionPromise = supabase.auth.getSession();
    }

    globalSessionPromise
      .then(async ({ data: { session } }) => {
        if (mounted) await handleSessionLoad(session);
      })
      .catch((err) => {
        console.error('getSession error:', err);
        if (mounted) setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) await handleSessionLoad(session);
    });

    // Backup timeout: Force loading to false after 5 seconds
    const backupTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timed out after 5s. Forcing ready state.');
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(backupTimeout);
    };
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

      if (profileError) {
        console.warn('Profile upsert failed during signup (often due to RLS when email confirmation is needed or triggers are handling it):', profileError.message);
      }
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
