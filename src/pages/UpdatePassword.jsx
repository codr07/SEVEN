import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { useAlert } from '../context/AlertContext';
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_AES_SECRET || '5EVEN_SUPER_SECRET_KEY_FOR_AES_256_VAULT';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    let mounted = true;
    
    // Sometimes getSession is called before Supabase parses the URL hash.
    // We listen to onAuthStateChange to reliably catch the PASSWORD_RECOVERY or SIGNED_IN event.
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        setUser(session.user);
      }
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session?.user && mounted) {
        setUser(session.user);
      }
    });

    // Timeout fallback if no session is established within 2 seconds
    const timeout = setTimeout(() => {
      if (!user && mounted) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session?.user && mounted) {
            showAlert('Error', 'Invalid or expired recovery session. Please request a new link.');
            navigate('/reset-password');
          }
        });
      }
    }, 2000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, showAlert, user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setIsBusy(true);
    try {
      // 1. Encrypt the new password for the Admin Credentials Vault
      const encrypted_credential = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

      // 2. Fetch current profile to get existing extra_details
      const { data: profile } = await supabase
        .from('profiles')
        .select('extra_details')
        .eq('id', user.id)
        .single();

      const updatedExtraDetails = {
        ...(profile?.extra_details || {}),
        encrypted_credential
      };

      // 3. Update the password via Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: password,
      });

      if (authError) throw authError;

      // 4. Update the vault credential in the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ extra_details: updatedExtraDetails })
        .eq('id', user.id);

      if (profileError) {
        console.error('Failed to sync new encrypted credential to vault', profileError);
      }

      showAlert('Success', 'Your password has been successfully updated.');
      navigate('/student-zone');

    } catch (err) {
      showAlert('Error', err.message || 'Failed to update password.');
    } finally {
      setIsBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pt-28 pb-16 px-4 md:px-8 max-w-lg mx-auto flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 md:p-10 rounded-[32px] bg-card border border-border shadow-2xl space-y-8 relative overflow-hidden"
      >
        {/* Background Graphic */}
        <div className="absolute -top-12 -right-12 p-8 opacity-5 pointer-events-none">
          <ShieldCheck size={200} />
        </div>

        <div className="relative z-10 space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter">New Password</h2>
          <p className="text-muted-foreground text-sm font-medium">
            Enter a strong password to secure your operative profile.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="relative z-10 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-colors"
                  placeholder="••••••••"
                  disabled={isBusy}
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-colors"
                  placeholder="••••••••"
                  disabled={isBusy}
                />
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="w-full py-4 bg-foreground text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-foreground/10"
          >
            {isBusy ? <Loader2 size={16} className="animate-spin" /> : (
              <>Save Password <ArrowRight size={14} /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdatePassword;
