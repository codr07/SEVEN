import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, HelpCircle, Bell } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 5000);
  }, [removeAlert]);

  const showConfirm = useCallback((message, onConfirm) => {
    setConfirmConfig({ message, onConfirm });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Toast Notifications Stack */}
      <div className="fixed top-8 right-8 z-[10001] flex flex-col gap-4 w-full max-w-[400px] pointer-events-none">
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => (
            <motion.div 
              key={alert.id}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={
                alert.type === 'error'
                  ? {
                      opacity: 1,
                      x: [50, -10, 10, -8, 8, -4, 4, 0],
                      scale: 1,
                      transition: { duration: 0.6 }
                    }
                  : { opacity: 1, x: 0, scale: 1 }
              }
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className="group relative overflow-hidden backdrop-blur-2xl bg-white/70 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center gap-5">
                {/* Glow Effect */}
                <div className={`absolute -inset-1 opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-40 ${
                  alert.type === 'success' ? 'bg-green-500' :
                  alert.type === 'error' ? 'bg-destructive' :
                  'bg-primary'
                }`} />

                <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center relative z-10 ${
                  alert.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                  alert.type === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                  'bg-primary/10 text-primary border border-primary/20'
                }`}>
                  {alert.type === 'success' ? <CheckCircle2 size={24} /> :
                   alert.type === 'error' ? <AlertCircle size={24} /> :
                   <Info size={24} />}
                </div>
                
                <div className="flex-1 min-w-0 relative z-10">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                    alert.type === 'error' ? 'text-destructive opacity-80 animate-pulse' : 'opacity-40'
                  }`}>
                    {alert.type === 'success' ? 'Protocol Success' :
                     alert.type === 'error' ? 'CRITICAL FAULT WARNING' :
                     'Intelligence Update'}
                  </p>
                  <p className="text-sm font-bold text-foreground leading-tight">
                    {alert.message}
                  </p>
                </div>

                <button 
                  onClick={() => removeAlert(alert.id)} 
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-destructive hover:text-white transition-all duration-300 group/close relative z-10"
                >
                  <X size={14} />
                </button>
                
                {/* Visual Progress Line */}
                <motion.div 
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 5, ease: "linear" }}
                  style={{ originX: 0 }}
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    alert.type === 'success' ? 'bg-green-500' :
                    alert.type === 'error' ? 'bg-destructive' :
                    'bg-primary'
                  } opacity-30`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog Overlay */}
      <AnimatePresence>
        {confirmConfig && (
          <div className="fixed inset-0 z-[10002] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmConfig(null)}
              className="absolute inset-0 bg-background/60 backdrop-blur-2xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md relative z-10"
            >
              <div className="overflow-hidden bg-white/70 dark:bg-black/40 backdrop-blur-3xl border border-black/10 dark:border-white/10 rounded-[48px] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-[32px] bg-primary/10 text-primary flex items-center justify-center mb-8 border border-primary/20 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]">
                    <HelpCircle size={40} />
                  </div>
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-4">Verification <span className="text-primary">Required</span></h3>
                  <p className="text-sm text-muted-foreground font-bold leading-relaxed mb-10 max-w-[280px]">
                    {confirmConfig.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setConfirmConfig(null)}
                    className="px-8 py-5 rounded-3xl border border-black/10 dark:border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-muted/50 transition-all active:scale-95"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={() => {
                      confirmConfig.onConfirm();
                      setConfirmConfig(null);
                    }}
                    className="px-8 py-5 rounded-3xl bg-gray-900 dark:bg-primary text-white font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/20 transition-all"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
