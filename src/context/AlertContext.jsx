import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, HelpCircle } from 'lucide-react';

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
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeAlert(id);
    }, 4000);
  }, [removeAlert]);

  const showConfirm = useCallback((message, onConfirm) => {
    setConfirmConfig({ message, onConfirm });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Toast Notifications */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001] flex flex-col gap-3 w-full max-w-sm px-4 md:px-0">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className="group relative overflow-hidden backdrop-blur-3xl bg-card/95 border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 fade-in zoom-in-95 duration-300 flex items-center gap-4 border-l-4 border-l-primary"
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              alert.type === 'success' ? 'bg-green-500/20 text-green-500' :
              alert.type === 'error' ? 'bg-destructive/20 text-destructive' :
              'bg-primary/20 text-primary'
            }`}>
              {alert.type === 'success' ? <CheckCircle2 size={20} /> :
               alert.type === 'error' ? <AlertCircle size={20} /> :
               <Info size={20} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-foreground line-clamp-2">
                {alert.message}
              </p>
            </div>

            <button 
              onClick={() => removeAlert(alert.id)} 
              className="p-1 hover:bg-white/5 rounded-lg transition-colors opacity-40 hover:opacity-100"
            >
              <X size={16} />
            </button>
            
            <div className="absolute bottom-0 left-0 h-0.5 bg-primary/40 animate-progress-shrink" />
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      {confirmConfig && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-card border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <HelpCircle size={32} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Are you sure?</h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-8">
              {confirmConfig.message}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmConfig(null)}
                className="flex-1 px-6 py-4 rounded-xl border border-border font-black uppercase tracking-widest text-[10px] hover:bg-accent transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmConfig.onConfirm();
                  setConfirmConfig(null);
                }}
                className="flex-1 px-6 py-4 rounded-xl bg-destructive text-destructive-foreground font-black uppercase tracking-widest text-[10px] hover:opacity-90 shadow-xl shadow-destructive/20 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
