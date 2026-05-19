import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, ShieldCheck, ArrowRight, ExternalLink, Timer, CheckCircle2, XCircle, Loader2, Home, Lock } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateInvoicePDF } from '../lib/invoiceGenerator';

const PaymentGateway = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  const amount = searchParams.get('amount') || location.state?.amount;
  const purpose = searchParams.get('purpose') || location.state?.purpose || '5EVEN Services';
  
  const [transactionId, setTransactionId] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [upiUri, setUpiUri] = useState('');
  const upiId = 'codr@slc';

  const [timeLeft, setTimeLeft] = useState(270);
  const [isExpired, setIsExpired] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, verifying, success
  const [isBusy, setIsBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Authentication Redirect
  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to StudentZone (Login/Signup) and pass current location so they can return
      navigate(`/student-zone?tab=dashboard`, { 
        state: { 
          returnTo: `/payment?amount=${amount || ''}&purpose=${encodeURIComponent(purpose)}`,
          message: 'Please log in or create an account to proceed with the payment.'
        }
      });
    }
  }, [user, authLoading, navigate, amount, purpose]);

  useEffect(() => {
    if (!user) return; // Don't generate if not logged in

    const trId = 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setTransactionId(trId);

    let uri = `upi://pay?pa=${upiId}&pn=5EVEN Institution&cu=INR&tr=${trId}`;
    if (amount) uri += `&am=${(parseFloat(amount) * 1.05).toFixed(2)}`;
    uri += `&tn=${encodeURIComponent(purpose)}`;
    
    setUpiUri(uri);
    
    const encodedUri = encodeURIComponent(uri);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUri}`);
  }, [amount, purpose, user]);

  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === 'pending') {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && paymentStatus === 'pending') {
      setIsExpired(true);
    }
  }, [timeLeft, paymentStatus]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDownloadProforma = async () => {
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const mockPayment = {
        id: 'pending',
        transaction_id: transactionId,
        amount: amount ? parseFloat(amount) * 1.05 : 0,
        purpose: purpose,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      const userProfile = {
        full_name: profile?.full_name || user.email?.split('@')[0] || 'Student',
        email: user.email || profile?.email || ''
      };
      await generateInvoicePDF(mockPayment, userProfile);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitPayment = async () => {
    if (!user) return;
    
    setPaymentStatus('verifying');
    setIsBusy(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('payments').insert([{
        user_id: user.id,
        amount: amount ? parseFloat(amount) * 1.05 : 0,
        purpose: purpose,
        transaction_id: transactionId,
        status: 'pending'
      }]);

      if (error) throw error;
      
      setPaymentStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to submit payment. Please ensure the database table is created or try again later.');
      setPaymentStatus('pending');
    } finally {
      setIsBusy(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-32 overflow-hidden text-foreground selection:bg-primary/20">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg z-10"
      >
        <div className="institution-card p-8 md:p-12 border-t-4 border-t-primary shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {isExpired ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <XCircle className="w-20 h-20 text-destructive mx-auto mb-6" />
              <h2 className="text-3xl font-black mb-4">Session Expired</h2>
              <p className="text-muted-foreground font-medium mb-8">
                Your payment session has timed out. The link is now invalid. Please go back and initiate the payment again.
              </p>
              <button onClick={() => navigate(-1)} className="w-full cool-button h-14 text-base">Go Back</button>
            </motion.div>
          ) : 
          
          paymentStatus === 'success' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                <ShieldCheck className="w-24 h-24 text-blue-500 mx-auto mb-6" />
              </motion.div>
              <h2 className="text-3xl font-black mb-4 text-blue-400">Verification Pending</h2>
              <p className="text-muted-foreground font-medium mb-8">
                Your payment (ID: {transactionId}) has been successfully submitted. Our administration team is currently reviewing it.
              </p>
              <div className="p-4 bg-muted border border-border rounded-xl mb-8 flex items-start gap-3 text-left">
                <CheckCircle2 className="text-green-500 mt-0.5 shrink-0" size={18} />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You will receive an alert in your Student Dashboard once the payment status changes to <strong className="text-foreground">PAID</strong>.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/student-zone')} className="w-full cool-button h-14 text-base flex items-center justify-center gap-2">
                  <Home size={20} /> View Dashboard
                </button>
                <button 
                  onClick={handleDownloadProforma} 
                  className="w-full cool-button-secondary h-14 text-base flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all duration-300"
                >
                  Download Proforma Bill (PDF)
                </button>
              </div>
            </motion.div>
          ) :
          
          paymentStatus === 'verifying' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin mb-8" />
              <h2 className="text-2xl font-bold mb-2">Submitting Details...</h2>
              <p className="text-sm text-muted-foreground">Please wait while we record your transaction securely.</p>
            </motion.div>
          ) : 
 
          (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <ShieldCheck className="text-primary w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black mb-2 text-animate-gradient">Checkout</h1>
                
                {(() => {
                  const cleanPurpose = purpose.replace(/\[.*?\]\s*/g, '').trim();
                  const isCourse = purpose.toLowerCase().includes('[course]');
                  const isNote = purpose.toLowerCase().includes('[note]');
                  const hasCert = purpose.toLowerCase().includes('[cert]');
                  return (
                    <div className="flex flex-col items-center gap-2 mb-4">
                      <p className="text-sm font-bold text-foreground uppercase tracking-widest">{cleanPurpose}</p>
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {isCourse && (
                          <span className="px-3 py-1 rounded-full text-[9px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                            Course
                          </span>
                        )}
                        {isNote && (
                          <span className="px-3 py-1 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
                            Study Material
                          </span>
                        )}
                        {hasCert && (
                          <span className="px-3 py-1 rounded-full text-[9px] font-black bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-widest">
                            Official Certification
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
                
                {amount ? (
                  <div className="space-y-2 mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                    <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                      <span>Base Price</span>
                      <span>₹{parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                      <span>CGST (2.5%)</span>
                      <span>₹{(parseFloat(amount) * 0.025).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                      <span>SGST (2.5%)</span>
                      <span>₹{(parseFloat(amount) * 0.025).toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex justify-between items-center font-black">
                      <span className="text-sm uppercase tracking-widest text-primary">Total Payable</span>
                      <span className="text-2xl text-white">₹{(parseFloat(amount) * 1.05).toFixed(2)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-white tracking-tight">Open Amount</div>
                )}
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-center mb-6">
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-5 py-2 rounded-full flex items-center gap-2 font-bold tracking-widest text-sm shadow-sm">
                  <Timer size={18} className="animate-pulse" />
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="relative p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  {qrUrl ? (
                    <div className="bg-white p-2 rounded-xl">
                      <img src={qrUrl} alt="UPI QR Code" className="w-52 h-52 object-cover rounded-lg shadow-sm" style={{ imageRendering: 'pixelated' }} />
                    </div>
                  ) : (
                    <div className="w-56 h-56 bg-white/5 animate-pulse rounded-xl flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-muted-foreground opacity-50" />
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
                  <QrCode size={14} /> Scan to Pay
                </p>
              </div>

              <div className="mb-6">
                <button 
                  onClick={handleSubmitPayment}
                  disabled={isBusy}
                  className="w-full h-[50px] bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isBusy ? <Loader2 size={18} className="animate-spin" /> : <>Submit for Verification <Lock size={16} /></>}
                </button>
                <p className="text-[10px] text-center text-muted-foreground mt-2 px-2">Click this ONLY after you have successfully paid via your app.</p>
              </div>

              <div className="relative md:hidden flex items-center py-4 mb-6">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <div className="flex flex-col gap-3 md:hidden">
                 <a href={upiUri} className="w-full h-[50px] cool-button-secondary flex items-center justify-center gap-2">
                    <ExternalLink size={18} /> Open UPI App
                 </a>
                 <p className="text-[10px] text-center text-muted-foreground mt-2 px-4">
                   Tap the button above to open your default UPI app directly.
                 </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                <span>TXN ID: {transactionId}</span>
                <span className="flex items-center gap-1 text-primary">Slice <ArrowRight size={10} /></span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentGateway;
