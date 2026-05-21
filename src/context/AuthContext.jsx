import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_AES_SECRET || '5EVEN_SUPER_SECRET_KEY_FOR_AES_256_VAULT';

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
            // Attempt to create the profile from user metadata if it's missing
            const meta = currentUser.user_metadata || {};

            // Generate initial ID
            let idNumber = '70326-0001';
            try {
              const { count, error: countError } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
              if (!countError) {
                const serial = ((count || 0) + 1).toString().padStart(4, '0');
                idNumber = `70326-${serial}`;
              }
            } catch (e) {
              console.warn('Failed to fetch count for ID generation', e);
            }

            // Fallback username from email if not in metadata
            const emailPrefix = currentUser.email ? currentUser.email.split('@')[0] : 'user';
            const fallbackUsername = `${emailPrefix}${Math.floor(Math.random() * 10000)}`;
            const username = meta.username || meta.preferred_username || fallbackUsername;

            const newProfile = {
              id: currentUser.id,
              username: username,
              full_name: meta.full_name || meta.name || '',
              email: currentUser.email,
              phone: meta.phone || '',
              avatar_url: meta.avatar_url || meta.picture || '',
              gender: meta.gender || '',
              social_links: meta.social_links || { linkedin: '', github: '', linktree: '' },
              role: 'student',
              extra_details: {
                id_number: idNumber,
                user_type: meta.user_type || '',
                user_subtype: meta.user_subtype || '',
                encrypted_credential: meta.encrypted_credential || '',
              },
              updated_at: new Date().toISOString(),
            };

            const { error: createError } = await supabase.from('profiles').insert(newProfile);

            if (createError) {
              console.error('Profile creation error (Retrying with absolute fallback):', createError);
              // Handle potential unique constraint violation for username
              if (createError.code === '23505') {
                const absoluteFallback = `${emailPrefix}_${Math.random().toString(36).slice(2, 7)}`;
                await supabase.from('profiles').insert({
                  ...newProfile,
                  username: absoluteFallback
                });
              }
            }

            // Final check/sync
            resolvedProfile = await fetchProfile(currentUser.id);
          }

          // Backfill email if missing in profiles table
          if (resolvedProfile && !resolvedProfile.email && currentUser.email) {
            try {
              await supabase.from('profiles').update({ email: currentUser.email }).eq('id', currentUser.id);
              resolvedProfile.email = currentUser.email;
              setProfile({ ...resolvedProfile });
            } catch (e) {
              console.warn('Failed to backfill email', e);
            }
          }

          // Backfill ID if missing
          if (resolvedProfile && !resolvedProfile.extra_details?.id_number) {
            try {
              const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
              const serial = ((count || 0) + 1).toString().padStart(4, '0');

              let prefix = '70326';
              if (resolvedProfile.role === 'faculty') prefix = '70326-FAC';
              if (resolvedProfile.role === 'admin') prefix = '70326-FND';

              const idNumber = `${prefix}-${serial}`;
              const updatedDetails = { ...(resolvedProfile.extra_details || {}), id_number: idNumber };

              await supabase.from('profiles').update({ extra_details: updatedDetails }).eq('id', currentUser.id);
              resolvedProfile.extra_details = updatedDetails;
              setProfile({ ...resolvedProfile });
            } catch (e) {
              console.warn('Failed to backfill ID', e);
            }
          }

          // Backfill user_type and user_subtype if missing
          const meta = currentUser.user_metadata || {};
          if (resolvedProfile && meta.user_type && !resolvedProfile.extra_details?.user_type) {
            try {
              const updatedDetails = {
                ...(resolvedProfile.extra_details || {}),
                user_type: meta.user_type,
                user_subtype: meta.user_subtype || '',
              };
              await supabase.from('profiles').update({ extra_details: updatedDetails }).eq('id', currentUser.id);
              resolvedProfile.extra_details = updatedDetails;
              setProfile({ ...resolvedProfile });
            } catch (e) {
              console.warn('Failed to backfill user_type/user_subtype', e);
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
        await supabase.auth.signOut().catch(() => { });
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

    // Backup timeout: Force loading to false after 15 seconds
    const backupTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timed out after 15s. Forcing ready state.');
        setLoading(false);
      }
    }, 15000);

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
      gender = '',
      avatarUrl = '',
      socialLinks = { linkedin: '', github: '', linktree: '' },
      user_type = '',
      user_subtype = '',
    } = profileData || {};

    const encrypted_credential = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/student-zone`,
        data: {
          username,
          full_name: fullName,
          phone,
          gender,
          avatar_url: avatarUrl,
          social_links: socialLinks,
          user_type,
          user_subtype,
          encrypted_credential,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const refreshProfile = async () => {
    if (!user?.id) return null;
    return fetchProfile(user.id);
  };

  const logout = async () => {
    try {
      // Attempt sign out locally first to ensure instant local logout, then clear server session
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    } catch (error) {
      console.warn("Sign out request failed, purging local state anyway:", error);
    } finally {
      // FORCE local state purge regardless of server success
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole('guest');
      // Clear persistence and all supabase tokens just in case
      try {
        localStorage.removeItem('seven-auth-v3-stable');
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('auth-token'))) {
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn("Error cleaning up localStorage:", e);
      }
    }
  };


  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/student-zone`,
      }
    });
    if (error) throw error;
    return data;
  };

  const deleteAccount = async () => {
    // Attempt to invoke a custom Postgres function 'delete_user'
    // This is the recommended approach for true account deletion in Supabase from the client
    const { error } = await supabase.rpc('delete_user');

    if (error) {
      console.warn("RPC 'delete_user' failed or not configured, falling back to deleting the profile...", error);
      // Fallback: Delete the user's profile row
      if (user?.id) {
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
        if (profileError) throw profileError;
      } else {
        throw error;
      }
    }

    // Log them out regardless
    await logout();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, role, profile, login, signup, logout, resetPassword, refreshProfile, deleteAccount, signInWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
