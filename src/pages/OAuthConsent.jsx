import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, Check, X, ShieldAlert, ExternalLink, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OAuthConsent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const authorizationId = searchParams.get('authorization_id');

  const [authDetails, setAuthDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authorizationId) {
      setError('Missing authorization_id parameter.');
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Using the internal auth API for the new OAuth Server feature
        // Note: SDK support might vary, so we use the RPC-style method if available
        const { data, error: fetchError } = await supabase.auth.getAuthorizationDetails(authorizationId);

        if (fetchError) throw fetchError;
        setAuthDetails(data);
      } catch (err) {
        console.error('Error fetching auth details:', err);
        setError(err.message || 'Failed to retrieve authorization request details.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        // Redirect to login but save the authorization_id
        const currentPath = window.location.pathname + window.location.search;
        navigate(`/student-zone?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
        return;
      }
      fetchDetails();
    }
  }, [authorizationId, user, authLoading, navigate]);

  const handleAuthorize = async (approved) => {
    try {
      setActionLoading(true);
      const { data, error: authError } = await supabase.auth.authorize(authorizationId, { approved });
      
      if (authError) throw authError;

      // The response from authorize often contains a redirect URL
      if (data?.redirect_to) {
        window.location.href = data.redirect_to;
      }
    } catch (err) {
      console.error('Authorization error:', err);
      setError(err.message || 'An error occurred while processing your request.');
      setActionLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Verifying Request...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full p-8 rounded-3xl bg-card border border-destructive/20 shadow-2xl shadow-destructive/10 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-foreground">Request Failed</h2>
          <p className="text-muted-foreground leading-relaxed italic">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-xl bg-background border border-border hover:bg-accent transition-all font-black uppercase tracking-widest text-xs"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const { client_name, scopes = [] } = authDetails || {};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="max-w-xl w-full p-1 border-t border-white/10 rounded-[32px] bg-gradient-to-br from-white/5 to-transparent relative z-10"
      >
        <div className="bg-card w-full h-full rounded-[30px] p-8 md:p-12 shadow-2xl backdrop-blur-xl border border-white/5">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-black text-xl italic">5</span>
              </div>
              <h1 className="text-lg font-black uppercase tracking-tighter">5EVEN Auth</h1>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Secure Session</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-none">
                AUTHORIZE <span className="text-primary">{client_name?.toUpperCase() || 'EXTERNAL APP'}</span>?
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                This application is requesting permission to access your 5EVEN account information.
              </p>
            </div>

            {/* Current User Info */}
            <div className="p-4 rounded-2xl bg-background/50 border border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-card overflow-hidden border border-border flex items-center justify-center">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Logged in as</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold truncate text-foreground">{user?.email}</p>
                  <Mail className="w-3 h-3 text-primary" />
                </div>
              </div>
            </div>

            {/* Scopes */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">Permissions Requested</p>
              <div className="grid gap-3">
                {scopes.length > 0 ? scopes.map((scope, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (index * 0.05) }}
                    key={scope} 
                    className="group p-4 rounded-2xl bg-background/30 border border-border hover:border-primary/30 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-bold capitalize tracking-tight">{scope.replace('_', ' ')}</span>
                    </div>
                    <Shield className="w-4 h-4 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                  </motion.div>
                )) : (
                  <p className="text-sm italic text-muted-foreground p-2">Basic profile access</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                disabled={actionLoading}
                onClick={() => handleAuthorize(true)}
                className="group relative w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {actionLoading ? 'Processing...' : (
                    <>
                      Confirm & Authorize <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </span>
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleAuthorize(false)}
                className="w-full py-5 rounded-2xl border border-border bg-transparent hover:bg-destructive/10 hover:border-destructive/20 text-muted-foreground hover:text-destructive transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel Request
              </button>
            </div>
          </div>

          {/* Footer Footer */}
          <div className="mt-10 pt-8 border-t border-border flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            <span>Powered by Supabase OAuth 2.1</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OAuthConsent;
