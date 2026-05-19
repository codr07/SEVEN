import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, ShieldCheck, ArrowRight, ExternalLink, Timer, CheckCircle2, XCircle, Loader2, Home, Lock, ChevronRight, FileText } from 'lucide-react';
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
  
  const cleanPurpose = purpose.replace(/\[.*?\]\s*/g, '').trim();
  const isCourse = purpose.toLowerCase().includes('[course]');
  const isNote = purpose.toLowerCase().includes('[note]');
  const hasCert = purpose.toLowerCase().includes('[cert]');

  const [transactionId, setTransactionId] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [upiUri, setUpiUri] = useState('');
  const upiId = 'codr@slc';

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoStatus, setPromoStatus] = useState(''); // 'success', 'error'
  const [promoApplying, setPromoApplying] = useState(false);

  const baseAmount = parseFloat(amount || '0') || 0;
  const discountAmount = appliedPromo ? baseAmount * discountPercent : 0;
  const finalBaseAmount = baseAmount - discountAmount;
  const finalTaxAmount = finalBaseAmount * 0.05; // 5% total tax (CGST + SGST)
  const finalTotalAmount = finalBaseAmount + finalTaxAmount;

  const [step, setStep] = useState(1); // 1 = Billing Details, 2 = Payment/QR
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pin: ''
  });
  const [payerUpiId, setPayerUpiId] = useState('');

  const [timeLeft, setTimeLeft] = useState(270);
  const [isExpired, setIsExpired] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, verifying, success
  const [isBusy, setIsBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Authentication Redirect & Profile Fetch
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/student-zone?tab=dashboard`, { 
        state: { 
          returnTo: `/payment?amount=${amount || ''}&purpose=${encodeURIComponent(purpose)}`,
          message: 'Please log in or create an account to proceed with the payment.'
        }
      });
    } else if (user) {
      // Pre-fill email
      setBillingDetails(prev => ({ ...prev, email: user.email }));
      
      // Try to fetch profile to pre-fill name
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (data && data.full_name) {
            setBillingDetails(prev => ({ ...prev, name: data.full_name }));
          } else if (data && data.username) {
            setBillingDetails(prev => ({ ...prev, name: data.username }));
          }
        });
    }
  }, [user, authLoading, navigate, amount, purpose]);

  useEffect(() => {
    if (!user) return;
    const trId = 'TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setTransactionId(trId);
  }, [user]);

  useEffect(() => {
    if (!user || !transactionId) return;

    let uri = `upi://pay?pa=${upiId}&pn=5EVEN Institution&cu=INR&tr=${transactionId}`;
    if (finalTotalAmount > 0) uri += `&am=${finalTotalAmount.toFixed(2)}`;
    uri += `&tn=${encodeURIComponent(purpose)}`;
    
    setUpiUri(uri);
    
    const encodedUri = encodeURIComponent(uri);
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUri}`);
  }, [finalTotalAmount, purpose, user, transactionId]);

  useEffect(() => {
    if (step === 2 && timeLeft > 0 && paymentStatus === 'pending') {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (step === 2 && timeLeft === 0 && paymentStatus === 'pending') {
      setIsExpired(true);
    }
  }, [step, timeLeft, paymentStatus]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!billingDetails.name || !billingDetails.email || !billingDetails.phone || !billingDetails.address || !billingDetails.city || !billingDetails.state || !billingDetails.pin) {
      setErrorMsg('Please fill in all billing details to proceed.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleDownloadProforma = async () => {
    try {
      const mockPayment = {
        id: 'pending',
        transaction_id: transactionId,
        amount: finalTotalAmount,
        purpose: purpose,
        status: 'pending',
        created_at: new Date().toISOString(),
        billing_name: billingDetails.name,
        billing_email: billingDetails.email,
        billing_phone: billingDetails.phone,
        billing_address: billingDetails.address,
        billing_city: billingDetails.city,
        billing_state: billingDetails.state,
        billing_pin: billingDetails.pin,
        payer_upi_id: payerUpiId
      };
      
      const userProfile = {
        full_name: billingDetails.name,
        email: billingDetails.email
      };
      await generateInvoicePDF(mockPayment, userProfile);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitPayment = async () => {
    if (!user) return;
    if (!payerUpiId) {
      setErrorMsg('Please enter the UPI ID used for the payment.');
      return;
    }
    
    setPaymentStatus('verifying');
    setIsBusy(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('payments').insert([{
        user_id: user.id,
        amount: finalTotalAmount,
        purpose: purpose,
        transaction_id: transactionId,
        status: 'pending',
        billing_name: billingDetails.name,
        billing_email: billingDetails.email,
        billing_phone: billingDetails.phone,
        billing_address: billingDetails.address,
        billing_city: billingDetails.city,
        billing_state: billingDetails.state,
        billing_pin: billingDetails.pin,
        payer_upi_id: payerUpiId
      }]);

      if (error) {
        // Fallback for missing columns. If columns aren't there, we just do a basic insert.
        // It's a hack, but makes it resilient if they haven't run the SQL yet.
        console.warn('Full insert failed. Trying basic insert...', error);
        const { error: basicError } = await supabase.from('payments').insert([{
          user_id: user.id,
          amount: finalTotalAmount,
          purpose: purpose,
          transaction_id: transactionId,
          status: 'pending'
        }]);
        if (basicError) throw basicError;
      }
      
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

  // cleanPurpose and type checks already declared at the top of the component

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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                  {step === 1 ? <FileText className="text-primary w-8 h-8" /> : <ShieldCheck className="text-primary w-8 h-8" />}
                </div>
                <h1 className="text-3xl font-black mb-2 text-animate-gradient">Checkout</h1>
                
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm font-bold text-foreground uppercase tracking-widest text-center">{cleanPurpose}</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {isCourse && <span className="px-3 py-1 rounded-full text-[9px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">Course</span>}
                    {isNote && <span className="px-3 py-1 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">Study Material</span>}
                    {hasCert && <span className="px-3 py-1 rounded-full text-[9px] font-black bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-widest">Official Certification</span>}
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive text-xs font-bold text-center border border-destructive/20">
                  {errorMsg}
                </div>
              )}

              {step === 1 ? (
                <AnimatePresence mode="wait">
                  <motion.form 
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleProceedToPayment}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-black uppercase tracking-widest text-primary">Billing Details</h3>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Step 1 of 2</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
                        <input type="text" required value={billingDetails.name} onChange={e => setBillingDetails(prev => ({...prev, name: e.target.value}))} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary transition-colors" placeholder="John Doe" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email</label>
                        <input type="email" required value={billingDetails.email} onChange={e => setBillingDetails(prev => ({...prev, email: e.target.value}))} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary transition-colors" placeholder="john@example.com" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Phone Number</label>
                        <input type="tel" required value={billingDetails.phone} onChange={e => setBillingDetails(prev => ({...prev, phone: e.target.value}))} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary transition-colors" placeholder="+91 9876543210" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Street Address</label>
                        <input type="text" required value={billingDetails.address} onChange={e => setBillingDetails(prev => ({...prev, address: e.target.value}))} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary transition-colors" placeholder="123 Main St, Apt 4B" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">City</label>
                        <input type="text" required value={billingDetails.city} onChange={e => setBillingDetails(prev => ({...prev, city: e.target.value}))} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary transition-colors" placeholder="Kolkata" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">State</label>
                        <input type="text" required value={billingDetails.state} onChange={e => setBillingDetails(prev => ({...prev, state: e.target.value}))} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary transition-colors" placeholder="West Bengal" />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">PIN / ZIP Code</label>
                        <input type="text" required value={billingDetails.pin} onChange={e => setBillingDetails(prev => ({...prev, pin: e.target.value}))} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary transition-colors" placeholder="700091" />
                      </div>
                    </div>

                    <button type="submit" className="w-full mt-4 h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                      Proceed to Payment <ChevronRight size={18} />
                    </button>
                  </motion.form>
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => setStep(1)} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-white transition-colors">
                        ← Back to Billing
                      </button>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Step 2 of 2</span>
                    </div>

                    {amount && (
                      <div className="space-y-2 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                        <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                          <span>Base Price</span>
                          <span>₹{baseAmount.toFixed(2)}</span>
                        </div>
                        {appliedPromo && (
                          <>
                            <div className="flex justify-between items-center text-xs text-green-500 uppercase tracking-widest font-bold">
                              <span>Discount ({(discountPercent * 100).toFixed(0)}%)</span>
                              <span>- ₹{discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                              <span>Discounted Base</span>
                              <span>₹{finalBaseAmount.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                          <span>CGST (2.5%)</span>
                          <span>₹{(finalBaseAmount * 0.025).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                          <span>SGST (2.5%)</span>
                          <span>₹{(finalBaseAmount * 0.025).toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="flex justify-between items-center font-black">
                          <span className="text-sm uppercase tracking-widest text-primary">Total Payable</span>
                          <span className="text-2xl text-white">₹{finalTotalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Coupon Promo Code Section */}
                    {amount && (
                      <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1 mb-2 block">
                          Promo / Coupon Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            disabled={!!appliedPromo || promoApplying}
                            className="flex-grow h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary transition-all uppercase font-bold tracking-widest disabled:opacity-50"
                          />
                          {appliedPromo ? (
                            <button
                              type="button"
                              onClick={() => {
                                setAppliedPromo('');
                                setDiscountPercent(0);
                                setPromoMessage('');
                                setPromoStatus('');
                                setPromoInput('');
                              }}
                              className="h-12 px-5 bg-destructive/20 border border-destructive/30 hover:bg-destructive/30 text-destructive text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={promoApplying}
                              onClick={async () => {
                                const cleaned = promoInput.trim().toUpperCase();
                                if (!cleaned) return;
                                setPromoApplying(true);
                                setPromoMessage('');
                                setPromoStatus('');
                                try {
                                  const { data, error } = await supabase
                                    .from('coupons')
                                    .select('*')
                                    .eq('code', cleaned)
                                    .eq('is_active', true)
                                    .limit(1)
                                    .single();
                                  if (error || !data) {
                                    setPromoMessage('Invalid or inactive coupon code.');
                                    setPromoStatus('error');
                                    return;
                                  }
                                  // Expiry check
                                  if (!data.never_expires && data.expires_at && new Date(data.expires_at) < new Date()) {
                                    setPromoMessage('This coupon code has expired.');
                                    setPromoStatus('error');
                                    return;
                                  }
                                  // Category check
                                  const purposeLower = purpose.toLowerCase();
                                  if (data.applies_to !== 'all') {
                                    if (!purposeLower.includes(`[${data.applies_to}]`)) {
                                      setPromoMessage(`This coupon is only valid for ${data.applies_to} purchases.`);
                                      setPromoStatus('error');
                                      return;
                                    }
                                  }
                                  // Min amount check
                                  if (baseAmount <= parseFloat(data.min_amount || 0)) {
                                    setPromoMessage(`This coupon requires a minimum bill of ₹${parseFloat(data.min_amount).toFixed(0)}.`);
                                    setPromoStatus('error');
                                    return;
                                  }
                                  // All checks passed
                                  const discPct = parseFloat(data.discount_pct) / 100;
                                  setAppliedPromo(cleaned);
                                  setDiscountPercent(discPct);
                                  setPromoMessage(`Coupon applied! ${data.discount_pct}% discount.`);
                                  setPromoStatus('success');
                                } catch (err) {
                                  console.error(err);
                                  setPromoMessage('Failed to validate coupon. Please try again.');
                                  setPromoStatus('error');
                                } finally {
                                  setPromoApplying(false);
                                }
                              }}
                              className="h-12 px-6 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/10 flex items-center gap-2 disabled:opacity-50"
                            >
                              {promoApplying ? <Loader2 size={13} className="animate-spin" /> : null}
                              Apply
                            </button>
                          )}
                        </div>
                        {promoMessage && (
                          <div className={`mt-2.5 text-[10px] font-black uppercase tracking-widest ${
                            promoStatus === 'success' ? 'text-green-500' : 'text-destructive'
                          }`}>
                            {promoStatus === 'success' ? '✓ ' : '✗ '} {promoMessage}
                          </div>
                        )}
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

                    <div className="space-y-4 mb-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Payer UPI ID (Required)</label>
                        <input type="text" required value={payerUpiId} onChange={e => setPayerUpiId(e.target.value)} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary transition-colors" placeholder="e.g. 9876543210@ybl" />
                        <p className="text-[10px] text-muted-foreground ml-1 mt-1">Enter the UPI ID you used to make the payment for verification.</p>
                      </div>

                      <button 
                        onClick={handleSubmitPayment}
                        disabled={isBusy}
                        className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isBusy ? <Loader2 size={18} className="animate-spin" /> : <>Submit for Verification <Lock size={16} /></>}
                      </button>
                    </div>

                    <div className="relative md:hidden flex items-center py-4 mb-6">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="flex-shrink-0 mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">OR</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <div className="flex flex-col gap-3 md:hidden">
                       <a href={upiUri} className="w-full h-12 cool-button-secondary flex items-center justify-center gap-2">
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
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentGateway;
