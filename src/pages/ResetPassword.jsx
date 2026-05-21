import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const { resetPassword } = useAuth();
  const { showAlert } = useAlert();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      showAlert('Error', 'Please enter your email address.');
      return;
    }

    setIsBusy(true);
    try {
      await resetPassword(email);
      showAlert('Success', 'A password reset link has been sent to your email.');
    } catch (err) {
      showAlert('Error', err.message || 'Failed to send reset email.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-16 px-4 md:px-8 max-w-lg mx-auto flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 md:p-10 rounded-[32px] bg-card border border-border shadow-2xl space-y-8 relative overflow-hidden"
      >
        {/* Background Graphic */}
        <div className="absolute -top-12 -right-12 p-8 opacity-5 pointer-events-none">
          <KeyRound size={200} />
        </div>

        <div className="relative z-10 space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Reset Password</h2>
          <p className="text-muted-foreground text-sm font-medium">
            Enter your email to receive a secure password recovery link.
          </p>
        </div>

        <form onSubmit={handleReset} className="relative z-10 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-colors"
                placeholder="operative@5even.com"
                disabled={isBusy}
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-primary/20"
          >
            {isBusy ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>

        <div className="relative z-10 text-center pt-2">
          <Link
            to="/student-zone"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
