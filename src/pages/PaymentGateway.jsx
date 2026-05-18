import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, QrCode, Copy, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const PaymentGateway = () => {
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const upiId = 'codr@slc';

  useEffect(() => {
    // Generate a random transaction ID for this session
    const trId = 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setTransactionId(trId);

    // Encode UPI URL
    const upiUri = `upi://pay?pa=${upiId}&pn=5EVEN Institution&cu=INR&tr=${trId}`;
    const encodedUri = encodeURIComponent(upiUri);
    
    // Generate QR Code via QRServer API
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUri}&color=ffffff&bgcolor=000000`);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-32 overflow-hidden text-foreground selection:bg-primary/20">
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg z-10"
      >
        <div className="institution-card p-8 md:p-12 border-t-4 border-t-primary shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <ShieldCheck className="text-primary w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black mb-2 text-animate-gradient">Secure Payment</h1>
            <p className="text-sm text-muted-foreground font-medium">Powered by Slice Bank UPI</p>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              {qrUrl ? (
                <img 
                  src={qrUrl} 
                  alt="UPI QR Code" 
                  className="w-56 h-56 object-cover rounded-xl shadow-lg mix-blend-screen filter brightness-200 contrast-150"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="w-56 h-56 bg-white/5 animate-pulse rounded-xl flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-muted-foreground opacity-50" />
                </div>
              )}
            </div>
            <p className="mt-4 text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
              <QrCode size={14} />
              Scan to Pay
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-4 mb-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* UPI ID Copy Section */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Pay via UPI ID</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-background/50 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-md">
                <CreditCard size={18} className="text-primary" />
                <span className="font-mono text-sm font-medium tracking-wide flex-1 truncate">{upiId}</span>
              </div>
              <button 
                onClick={handleCopy}
                className={`h-[50px] px-4 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                  copied 
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                  : 'bg-primary/20 border-primary/50 text-primary hover:bg-primary/30'
                }`}
              >
                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            <span>TXN ID: {transactionId}</span>
            <span className="flex items-center gap-1 text-primary">
              Slice <ArrowRight size={10} />
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentGateway;
