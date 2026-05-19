import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

import GlassSelect from '../components/GlassSelect';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Package,
  Pencil,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
  User,
  Users,
  X,
  Eye,
  EyeOff,
  Search,
  Laptop,
  Code,
  Cpu,
  Rocket,
  ChevronRight,
  TrendingUp,
  History,
  Activity,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  Link,
  Eraser,
  Undo,
  Redo,
  Strikethrough,
  Type,
  Quote,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Subscript,
  Superscript,
  Minus,
  Palette,
  Highlighter,
  Tag,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Infinity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useAlert } from '../context/AlertContext';
import { orderedFetch } from '../lib/supabase';
import { generateInvoicePDF } from '../lib/invoiceGenerator';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'seven-admin-auth-v3',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: (name, acquireTimeout, fn) => fn(),
  },
});

const CONTENT_TABLES = [
  { id: 'courses', name: 'Courses' },
  { id: 'academics', name: 'Academics' },
  { id: 'services', name: 'Services' },
  { id: 'faculty', name: 'Faculty' },
  { id: 'notes', name: 'Notes' },
  { id: 'founders', name: 'Founders' },
  { id: 'service_inquiries', name: 'Service Inquiries' },
  { id: 'updates', name: 'Platform Updates' }
];

const ALL_TABLES = [
  ...CONTENT_TABLES,
  { id: 'profiles', name: 'Users' },
  { id: 'student_submissions', name: 'Submissions' },
  { id: 'payments', name: 'Payments' }
];

const ADMIN_TABS = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  ...CONTENT_TABLES.map((t) => ({ id: t.id, name: t.name, icon: Package })),
  { id: 'workflow_designer', name: 'Workflow Designer', icon: Settings },
  { id: 'users', name: 'Users & Roles', icon: Users },
  { id: 'student_submissions', name: 'Student Submissions', icon: Upload },
  { id: 'payments', name: 'Payments', icon: Activity },
  { id: 'coupons', name: 'Coupon Codes', icon: Tag },
];

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 rounded-3xl border border-border bg-card shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary mx-auto mb-3 flex items-center justify-center">
            <Settings size={26} />
          </div>
          <h1 className="text-3xl font-black">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin login is separate from website UI and controls only /seven-mod.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Admin Email" required>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
            />
          </Field>
          <Field label="Password" required>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
            />
          </Field>

          {error ? <MessageBox type="error">{error}</MessageBox> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

const SevenMod = () => {
  const { showAlert, showConfirm } = useAlert();
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [adminRole, setAdminRole] = useState('guest');
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tableData, setTableData] = useState([]);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [couponForm, setCouponForm] = useState({ code: '', discount_pct: 15, min_amount: 0, applies_to: 'all', never_expires: true, expires_at: '', is_active: true, is_infinite_uses: true, max_uses: '' });
  const [couponEditId, setCouponEditId] = useState(null);
  const [couponSaving, setCouponSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [graphTimeframes, setGraphTimeframes] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const fetchRowsWithCreatedAtFallback = async (tableName, selectClause = '*') => {
    return await orderedFetch(adminSupabase, tableName, selectClause);
  };

  const loadAdminRole = async (userId) => {
    if (!userId) {
      setAdminRole('guest');
      return;
    }

    const { data, error } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      setAdminRole('guest');
      return;
    }

    setAdminRole(data?.role || 'student');
  };

  useEffect(() => {
    let mounted = true;

    const handleSession = async (session) => {
      if (!mounted) return;
      try {
        const user = session?.user ?? null;
        setAdminUser(user);
        await loadAdminRole(user?.id);
      } catch (err) {
        console.error('Session handle error:', err);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    adminSupabase.auth.getSession()
      .then(({ data: { session } }) => handleSession(session))
      .catch((err) => {
        console.error('getSession error:', err);
        if (mounted) setAuthLoading(false);
      });

    const { data: { subscription } } = adminSupabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    const safetyTimer = setTimeout(() => {
      if (mounted && authLoading) setAuthLoading(false);
    }, 2000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const handleAdminLogin = async (email, password) => {
    const { data, error: authError } = await adminSupabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;

    const { data: profileData, error: profileError } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || profileData?.role !== 'admin') {
      await adminSupabase.auth.signOut();
      throw new Error('Unauthorized access. Admin privileges required.');
    }
  };

  const handleLogout = async () => {
    const { error } = await adminSupabase.auth.signOut();
    if (error) {
      showAlert(error.message || 'Failed to sign out. Please try again.', 'error');
      return;
    }
    setAdminUser(null);
    setAdminRole('guest');
    setActiveTab('dashboard');
  };

  useEffect(() => {
    if (!adminUser || adminRole !== 'admin') return;
    fetchStats();
  }, [adminUser, adminRole]);

  useEffect(() => {
    if (!adminUser || adminRole !== 'admin') return;

    if (activeTab === 'dashboard') return;
    if (activeTab === 'users') {
      fetchUsers();
      return;
    }
    if (activeTab === 'student_submissions') {
      fetchSubmissions();
      return;
    }
    if (activeTab === 'payments') {
      fetchPayments();
      return;
    }
    if (activeTab === 'coupons') {
      fetchCoupons();
      return;
    }

    fetchTable(activeTab);
  }, [activeTab, adminUser, adminRole]);

  const backfillAllIDs = async () => {
    setLoading(true);
    try {
      const tablesToSync = ['profiles', 'faculty', 'founders'];
      let totalUpdated = 0;

      for (const tableName of tablesToSync) {
        const { data: rows, error } = await adminSupabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: true });

        if (error || !rows) continue;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          let extra = row.extra_details;
          if (typeof extra === 'string') {
            try { extra = JSON.parse(extra); } catch { extra = {}; }
          }
          if (!extra) extra = {};

          if (!extra.id_number) {
            const serial = String(i + 1).padStart(4, '0');
            const prefix = tableName === 'founders' ? '70326-FND' : tableName === 'faculty' ? '70326-FAC' : '70326';
            const idNumber = `${prefix}-${serial}`;

            const newExtra = { ...extra, id_number: idNumber };
            if (tableName === 'founders' && !newExtra.manifesto_id) {
              newExtra.manifesto_id = idNumber;
            }

            const { error: upErr } = await adminSupabase
              .from(tableName)
              .update({ extra_details: newExtra })
              .eq('id', row.id);

            if (!upErr) totalUpdated++;
          }
        }
      }

      if (totalUpdated > 0) {
        showAlert(`Synchronized ${totalUpdated} identities across all systems.`, 'success');
        if (activeTab === 'users') fetchUsers();
        else fetchTable(activeTab);
      }
    } catch (err) {
      console.error('Backfill error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminRole === 'admin' && (activeTab === 'users' || activeTab === 'faculty' || activeTab === 'founders')) {
      backfillAllIDs();
    }
  }, [activeTab, adminRole]);

  const fetchStats = async () => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const today = new Date(now.getTime() - oneDay);
    const lastWeek = new Date(now.getTime() - 7 * oneDay);
    const lastMonth = new Date(now.getTime() - 30 * oneDay);
    const lastQuarter = new Date(now.getTime() - 90 * oneDay);

    const tableStats = await Promise.all(
      ALL_TABLES.map(async (table) => {
        const { data, error } = await adminSupabase
          .from(table.id)
          .select('*');

        let subCategories = {};
        let totalStats = { Daily: 0, Weekly: 0, Monthly: 0, Quarterly: 0, Lifetime: (data || []).length };

        (data || []).forEach(item => {
          const typeName = item.category || item.role || item.topic || item.type || item.submission_type || 'General';
          if (!subCategories[typeName]) {
            subCategories[typeName] = { Daily: 0, Weekly: 0, Monthly: 0, Quarterly: 0, Lifetime: 0 };
          }
          subCategories[typeName].Lifetime++;

          if (!item.created_at) return;
          const created = new Date(item.created_at);

          if (created >= today) { totalStats.Daily++; subCategories[typeName].Daily++; }
          if (created >= lastWeek) { totalStats.Weekly++; subCategories[typeName].Weekly++; }
          if (created >= lastMonth) { totalStats.Monthly++; subCategories[typeName].Monthly++; }
          if (created >= lastQuarter) { totalStats.Quarterly++; subCategories[typeName].Quarterly++; }
        });

        const subCatArray = Object.keys(subCategories).map(key => ({
          name: key,
          ...subCategories[key]
        }));

        return {
          tableName: table.id,
          name: table.name,
          count: totalStats.Lifetime,
          ...totalStats,
          subCategories: subCatArray
        };
      })
    );
    setStats(tableStats);
  };

  const fetchTable = async (tableName) => {
    setLoading(true);
    try {
      const { data, error } = await fetchRowsWithCreatedAtFallback(tableName);
      if (error) throw error;
      setTableData(data || []);
    } catch (err) {
      console.error(`Failed to fetch ${tableName}:`, err);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchRowsWithCreatedAtFallback(
        'profiles',
        'id, username, full_name, phone, avatar_url, role, extra_details, created_at'
      );

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchRowsWithCreatedAtFallback('student_submissions');

      if (error) throw error;

      const authorIds = [...new Set((data || []).map((item) => item.author_id).filter(Boolean))];
      let profilesMap = {};

      if (authorIds.length) {
        const { data: profileRows } = await adminSupabase
          .from('profiles')
          .select('id, full_name, username, role')
          .in('id', authorIds);

        profilesMap = (profileRows || []).reduce((acc, row) => {
          acc[row.id] = row;
          return acc;
        }, {});
      }

      setSubmissions(
        (data || []).map((item) => ({
          ...item,
          author_profile: profilesMap[item.author_id] || null,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data: couponsData, error: couponsError } = await adminSupabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (couponsError) throw couponsError;

      // Fetch payments containing coupon codes to count uses
      const { data: paymentsData, error: paymentsError } = await adminSupabase
        .from('payments')
        .select('coupon_code, status')
        .not('coupon_code', 'is', null);

      const usageCounts = {};
      if (!paymentsError && paymentsData) {
        paymentsData.forEach(p => {
          if (p.status === 'paid' || p.status === 'pending' || p.status === 'verifying') {
            const code = (p.coupon_code || '').trim().toUpperCase();
            if (code) {
              usageCounts[code] = (usageCounts[code] || 0) + 1;
            }
          }
        });
      }

      setCouponsList((couponsData || []).map(c => ({
        ...c,
        uses_count: usageCounts[c.code.toUpperCase()] || 0
      })));
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
      setCouponsList([]);
    } finally {
      setLoading(false);
    }
  };

  const saveCoupon = async () => {
    if (!couponForm.code.trim()) {
      showAlert('Coupon code cannot be empty.', 'error');
      return;
    }
    if (couponForm.discount_pct <= 0 || couponForm.discount_pct > 100) {
      showAlert('Discount must be between 1% and 100%.', 'error');
      return;
    }
    if (!couponForm.never_expires && !couponForm.expires_at) {
      showAlert('Please set an expiry date/time or enable Never Expires.', 'error');
      return;
    }
    if (!couponForm.is_infinite_uses && (!couponForm.max_uses || parseInt(couponForm.max_uses) <= 0)) {
      showAlert('Please enter a valid maximum uses count.', 'error');
      return;
    }
    setCouponSaving(true);
    try {
      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discount_pct: parseFloat(couponForm.discount_pct),
        min_amount: parseFloat(couponForm.min_amount) || 0,
        applies_to: couponForm.applies_to,
        never_expires: couponForm.never_expires,
        expires_at: couponForm.never_expires ? null : new Date(couponForm.expires_at).toISOString(),
        is_active: couponForm.is_active,
        max_uses: couponForm.is_infinite_uses ? null : parseInt(couponForm.max_uses)
      };
      let error;
      if (couponEditId) {
        ({ error } = await adminSupabase.from('coupons').update(payload).eq('id', couponEditId));
      } else {
        ({ error } = await adminSupabase.from('coupons').insert([payload]));
      }
      if (error) throw error;
      showAlert(couponEditId ? 'Coupon updated successfully.' : 'Coupon created successfully.', 'success');
      setCouponForm({
        code: '',
        discount_pct: 15,
        min_amount: 0,
        applies_to: 'all',
        never_expires: true,
        expires_at: '',
        is_active: true,
        is_infinite_uses: true,
        max_uses: ''
      });
      setCouponEditId(null);
      fetchCoupons();
    } catch (err) {
      showAlert(err.message || 'Failed to save coupon.', 'error');
    } finally {
      setCouponSaving(false);
    }
  };

  const deleteCoupon = (id) => {
    showConfirm('Delete this coupon?', async () => {
      const { error } = await adminSupabase.from('coupons').delete().eq('id', id);
      if (error) { showAlert(error.message, 'error'); return; }
      fetchCoupons();
    });
  };

  const startEditCoupon = (c) => {
    setCouponEditId(c.id);
    setCouponForm({
      code: c.code,
      discount_pct: c.discount_pct,
      min_amount: c.min_amount,
      applies_to: c.applies_to,
      never_expires: c.never_expires,
      expires_at: c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : '',
      is_active: c.is_active,
      is_infinite_uses: c.max_uses === null || c.max_uses === undefined,
      max_uses: c.max_uses !== null && c.max_uses !== undefined ? c.max_uses : ''
    });
  };

  const cancelCouponEdit = () => {
    setCouponEditId(null);
    setCouponForm({
      code: '',
      discount_pct: 15,
      min_amount: 0,
      applies_to: 'all',
      never_expires: true,
      expires_at: '',
      is_active: true,
      is_infinite_uses: true,
      max_uses: ''
    });
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchRowsWithCreatedAtFallback('payments');
      if (error) throw error;
      
      const userIds = [...new Set((data || []).map((item) => item.user_id).filter(Boolean))];
      let profilesMap = {};
      
      if (userIds.length) {
        const { data: profileRows } = await adminSupabase
          .from('profiles')
          .select('id, full_name, username, email')
          .in('id', userIds);
          
        profilesMap = (profileRows || []).reduce((acc, row) => {
          acc[row.id] = row;
          return acc;
        }, {});
      }
      
      setPaymentsList((data || []).map(item => ({
        ...item,
        user_profile: profilesMap[item.user_id] || null
      })));
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setPaymentsList([]);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id, status) => {
    const { error } = await adminSupabase
      .from('payments')
      .update({ status })
      .eq('id', id);
      
    if (error) {
      showAlert(error.message, 'error');
      return;
    }

    // If status is 'paid', find the payment in paymentsList and send email
    if (status === 'paid') {
      const paymentItem = paymentsList.find(p => p.id === id);
      if (paymentItem && paymentItem.user_profile?.email) {
        
        let pdfBase64 = null;
        try {
          const userProfileForPdf = {
            full_name: paymentItem.billing_name || paymentItem.user_profile.full_name || paymentItem.user_profile.username || 'Student',
            email: paymentItem.billing_email || paymentItem.user_profile.email || ''
          };
          pdfBase64 = await generateInvoicePDF(paymentItem, userProfileForPdf, true);
        } catch (err) {
          console.error('Failed to generate base64 PDF for email:', err);
        }

        const title = paymentItem.purpose.replace(/\[.*?\]\s*/g, '');
        const amount = paymentItem.amount;
        const user_email = paymentItem.billing_email || paymentItem.user_profile.email;
        const user_name = paymentItem.billing_name || paymentItem.user_profile.full_name || paymentItem.user_profile.username || 'Student';
        
        adminSupabase.functions.invoke('send-email', {
          body: {
            type: 'purchase_confirmation',
            email: user_email,
            name: user_name,
            purpose: paymentItem.purpose,
            amount: `₹${amount}`,
            transaction_id: paymentItem.transaction_id || paymentItem.id,
            origin: window.location.origin,
            invoice_pdf_base64: pdfBase64,
            billing: {
              name: paymentItem.billing_name,
              email: paymentItem.billing_email,
              phone: paymentItem.billing_phone,
              address: paymentItem.billing_address,
              city: paymentItem.billing_city,
              state: paymentItem.billing_state,
              pin: paymentItem.billing_pin,
              payer_upi_id: paymentItem.payer_upi_id
            }
          }
        })
        .then((res) => {
          if (res.error) throw res.error;
          console.log('Purchase confirmation email sent successfully via Supabase!', res.data);
        })
        .catch((err) => {
          console.error('Failed to send email via Supabase:', err);
        });
      }
    }
    
    setPaymentsList(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const removeItem = async (tableName, id) => {
    showConfirm('Delete this item?', async () => {
      const { error } = await adminSupabase.from(tableName).delete().eq('id', id);
      if (error) {
        showAlert(error.message, 'error');
        return;
      }

      if (tableName === 'student_submissions') {
        fetchSubmissions();
      } else if (tableName === 'profiles') {
        fetchUsers();
      } else if (tableName === 'payments') {
        fetchPayments();
      } else {
        fetchTable(tableName);
      }

      fetchStats();
    });
  };

  const toggleVisibility = async (tableName, item) => {
    let currentDetails = {};
    if (typeof item.extra_details === 'string') {
      try { currentDetails = JSON.parse(item.extra_details) || {}; } catch { }
    } else if (item.extra_details && typeof item.extra_details === 'object') {
      currentDetails = { ...item.extra_details };
    }

    const currentVisible = currentDetails.is_visible !== false;
    currentDetails.is_visible = !currentVisible;

    const { error } = await adminSupabase
      .from(tableName)
      .update({ extra_details: currentDetails })
      .eq('id', item.id);

    if (error) {
      if (error.code === '42703') {
        showAlert(`Visibility toggle not supported for ${tableName} (missing column)`, 'error');
      } else {
        showAlert(error.message, 'error');
      }
      return;
    }

    fetchTable(tableName);
  };

  const updateUserRole = async (id, nextRole) => {
    const { error } = await adminSupabase
      .from('profiles')
      .update({ role: nextRole, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      showAlert(error.message, 'error');
      return;
    }

    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: nextRole } : u)));
  };

  const togglePush = async (item) => {
    const nextPushed = !item.is_pushed;
    const { error } = await adminSupabase
      .from('student_submissions')
      .update({
        is_pushed: nextPushed,
        moderation_status: nextPushed ? 'pushed' : 'unpushed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id);

    if (error) {
      showAlert(error.message, 'error');
      return;
    }

    fetchSubmissions();
  };

  const activeTableTitle = useMemo(() => {
    const found = ADMIN_TABS.find((t) => t.id === activeTab);
    return found?.name || activeTab;
  }, [activeTab]);

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminUser) return <LoginScreen onLogin={handleAdminLogin} />;

  if (adminRole !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <AlertCircle size={30} />
        </div>
        <h2 className="text-3xl font-black">Access Denied</h2>
        <p className="text-muted-foreground mt-2 max-w-lg">
          This panel is admin-only. Ask an admin to assign role from the Users & Roles section.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 px-6 py-3 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-xs"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col md:flex-row overflow-hidden">
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border p-4 md:p-6 bg-card flex flex-col flex-shrink-0 z-20">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0">
              <Settings size={20} />
            </div>
            <div>
              <p className="font-black text-base md:text-lg leading-tight">5EVEN Admin</p>
              <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-black text-muted-foreground">Control Center</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="md:hidden flex items-center justify-center p-2.5 rounded-xl border border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>

        <nav data-lenis-prevent="true" className="flex overflow-x-auto md:flex-col gap-2 md:gap-0 md:space-y-2 pb-2 md:pb-0 custom-scrollbar">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 whitespace-nowrap w-auto md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-black transition-all ${activeTab === tab.id ? 'bg-foreground text-background shadow-lg shadow-foreground/10' : 'hover:bg-background text-muted-foreground border border-transparent md:border-none hover:border-border'
                  }`}
              >
                <Icon size={14} className="md:w-4 md:h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="hidden md:flex mt-auto w-full items-center justify-center gap-2 px-4 py-3 rounded-xl border border-destructive/40 text-destructive font-black uppercase tracking-widest text-xs hover:bg-destructive hover:text-white transition-all flex-shrink-0"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      <main data-lenis-prevent="true" className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-animate-gradient">{activeTableTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage all data, users, and publishing workflow.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-3 md:py-3.5 rounded-2xl bg-card border border-border text-sm outline-none focus:border-primary transition-all"
              />
            </div>          <div className="flex items-center gap-4">
              {(CONTENT_TABLES.some(t => t.id === activeTab) || activeTab === 'student_submissions') && (
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                  }}
                  className="cool-button px-6 h-12 text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <Plus size={16} /> New Entry
                </button>
              )}
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((item, idx) => (
                <motion.div
                  key={item.tableName}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group overflow-hidden p-6 rounded-[32px] border border-white/10 bg-card hover:border-primary/50 transition-all shadow-xl"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground mb-2">{item.tableName.replace('_', ' ')}</p>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black tracking-tighter">{item.count}</p>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      {idx % 4 === 0 ? <Package size={20} /> : idx % 4 === 1 ? <Users size={20} /> : idx % 4 === 2 ? <FileText size={20} /> : <Settings size={20} />}
                    </div>
                  </div>
                  <div className="mt-4 h-1 w-full bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((item.count / 100) * 100, 100)}%` }}
                      className="h-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </motion.div>
              ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-card border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  Product Distribution
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.filter(s => CONTENT_TABLES.some(t => t.id === s.tableName))}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="tableName"
                      >
                        {stats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#A855F7', '#EC4899', '#3B82F6', '#10B981'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group col-span-1 lg:col-span-2">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-accent rounded-full" />
                  Growth Analytics
                </h3>
                <div className="grid grid-cols-1 gap-8">
                  {stats.filter(s => CONTENT_TABLES.some(t => t.id === s.tableName) || s.tableName === 'profiles').map((stat, idx) => {
                    const timeframe = graphTimeframes[stat.tableName] || 'Lifetime';
                    const data = stat.subCategories || [];

                    return (
                      <div key={stat.tableName} className="h-[320px] w-full bg-black/5 dark:bg-white/5 rounded-3xl p-6 border border-black/5 dark:border-white/5 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{stat.name}</p>
                          <p className="text-2xl font-black text-primary">{stat[timeframe]}</p>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-6 bg-black/10 dark:bg-white/5 p-1 rounded-xl">
                          {['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Lifetime'].map(tf => (
                            <button
                              key={tf}
                              onClick={() => setGraphTimeframes(prev => ({ ...prev, [stat.tableName]: tf }))}
                              className={`flex-1 py-1.5 px-1 sm:px-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all ${timeframe === tf ? 'bg-white dark:bg-white/10 shadow-sm text-primary' : 'text-muted-foreground hover:bg-white/5'}`}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>

                        <div className="flex-1 w-full relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} allowDecimals={false} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                                cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }}
                              />
                              <Line
                                type="monotone"
                                dataKey={timeframe}
                                stroke={['#A855F7', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'][idx % 6]}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: '#111' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {CONTENT_TABLES.some((t) => t.id === activeTab) && (
          <section>
            {loading ? (
              <div className="h-56 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : tableData.length === 0 ? (
              <EmptyState text="No entries found in this table." />
            ) : (
              <>{(() => {
                const visibleTableData = tableData.filter(item => {
                  if (!searchQuery) return true;
                  const searchLower = searchQuery.toLowerCase();
                  return (
                    String(item.name || '').toLowerCase().includes(searchLower) ||
                    String(item.title || '').toLowerCase().includes(searchLower) ||
                    String(item.role || '').toLowerCase().includes(searchLower) ||
                    String(item.short_desc || '').toLowerCase().includes(searchLower) ||
                    String(item.description || '').toLowerCase().includes(searchLower) ||
                    String(item.topic || '').toLowerCase().includes(searchLower) ||
                    String(item.category || '').toLowerCase().includes(searchLower)
                  );
                });

                const counters = { Total: visibleTableData.length };
                visibleTableData.forEach(item => {
                  const typeName = item.category || item.role || item.topic || item.type;
                  if (typeName) {
                    counters[typeName] = (counters[typeName] || 0) + 1;
                  }
                });

                // Display only Total if that's the only counter
                const hasCategories = Object.keys(counters).length > 1;

                return (
                  <div className="flex flex-col gap-6 w-full">
                    <div className="flex flex-wrap gap-2 w-full">
                      <div className="px-3 py-1.5 bg-card/60 backdrop-blur-sm border border-border rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                        <span className="text-muted-foreground uppercase tracking-widest">Total:</span>
                        <span className="text-primary">{counters.Total}</span>
                      </div>
                      {hasCategories && Object.entries(counters).filter(([label]) => label !== 'Total').map(([label, count]) => (
                        <div key={label} className="px-3 py-1.5 bg-card/60 backdrop-blur-sm border border-border rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                          <span className="text-muted-foreground uppercase tracking-widest">{label}:</span>
                          <span className="text-primary">{count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {visibleTableData.map((item) => {
                        const itemCategory = item.category || item.topic || item.role || item.submission_type || item.type || 'General';
                        return (
                          <article key={item.id} className="relative pl-12 p-6 rounded-3xl border border-primary/20 bg-card space-y-5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all overflow-hidden h-full flex flex-col">
                            {/* Vertical Category Line */}
                            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col items-center py-4 bg-primary/5 border-r border-primary/20">
                              <div className="flex-1 w-px bg-gradient-to-b from-primary/50 to-transparent mb-4" />
                              <div className="text-[8px] font-black text-primary rotate-180 uppercase tracking-[0.3em] [writing-mode:vertical-lr] whitespace-nowrap opacity-70">
                                {itemCategory}
                              </div>
                              <div className="flex-1 w-px bg-gradient-to-t from-primary/50 to-transparent mt-4" />
                            </div>
                            <div className="flex gap-4">
                              {(item.cover_image || item.image_url || item.thumbnail || item.avatar_url) && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border flex-shrink-0 bg-muted">
                                  <img
                                    src={item.cover_image || item.image_url || item.thumbnail || item.avatar_url}
                                    alt="thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-black text-lg line-clamp-1">{item.name || item.title || item.role || 'Untitled'}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {item.short_desc || item.description || item.bio || 'No description'}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="px-3 py-1 rounded-lg badge-glass text-[9px]">
                                    {item.category || item.topic || 'General'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                title={item.extra_details?.is_visible === false ? "Hidden on site. Click to show." : "Visible on site. Click to hide."}
                                onClick={() => toggleVisibility(activeTab, item)}
                                className={`px-4 py-2.5 rounded-xl flex items-center justify-center transition-all ${item.extra_details?.is_visible === false
                                  ? 'border border-muted text-muted-foreground bg-muted/10'
                                  : 'border border-primary/40 text-primary bg-primary/5'
                                  }`}
                              >
                                {item.extra_details?.is_visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsModalOpen(true);
                                }}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-primary/30 text-[10px] uppercase tracking-widest font-black flex items-center justify-center gap-2 hover:bg-primary/10 transition-all text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                              >
                                <Pencil size={12} /> Edit Entry
                              </button>
                              <button
                                onClick={() => removeItem(activeTab, item.id)}
                                className="px-4 py-2.5 rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}</>
            )}
          </section>
        )}

        {activeTab === 'users' && (
          <section>
            {loading ? (
              <div className="h-56 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <EmptyState text="No users found." />
            ) : (
              <div className="space-y-3">
                {users.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-border bg-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
                        {item.avatar_url ? <img src={item.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : <User size={18} className="text-primary" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold">{item.full_name || item.username || item.id}</p>
                          {(() => {
                            let extra = item.extra_details;
                            if (typeof extra === 'string') {
                              try { extra = JSON.parse(extra); } catch { extra = {}; }
                            }
                            if (!extra?.user_type) return null;
                            const type = extra.user_type;
                            const subtype = extra.user_subtype || 'general';
                            let badgeStyle = "bg-primary/10 text-primary border-primary/20";
                            if (type === 'student') {
                              badgeStyle = "bg-violet-500/10 text-violet-400 border-violet-500/25";
                            } else if (type === 'professional') {
                              badgeStyle = "bg-amber-500/10 text-amber-400 border-amber-500/25";
                            } else if (type === 'aspirant') {
                              badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
                            }
                            return (
                              <span className={`px-2 py-0.5 rounded-lg font-black uppercase text-[8px] tracking-widest border ${badgeStyle}`}>
                                {type} ({subtype})
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-muted-foreground">{item.phone || 'No phone'} • {item.id.slice(0, 8)}...</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl border border-border text-primary hover:bg-primary/10 transition-all"
                        title="Edit profile"
                      >
                        <Pencil size={14} />
                      </button>
                      <GlassSelect
                        value={item.role || 'student'}
                        onChange={(val) => updateUserRole(item.id, val)}
                        options={[
                          { value: 'admin', label: 'Admin' },
                          { value: 'student', label: 'Student' },
                          { value: 'faculty', label: 'Faculty' }
                        ]}
                        className="w-36"
                      />
                      <button
                        onClick={() => removeItem('profiles', item.id)}
                        className="px-3 py-2 rounded-xl border border-destructive/40 text-destructive"
                        title="Delete profile"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'student_submissions' && (
          <section>
            {loading ? (
              <div className="h-56 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : submissions.length === 0 ? (
              <EmptyState text="No submissions found." />
            ) : (
              <div className="space-y-3">
                {submissions.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-border bg-card space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-black text-lg">{item.title}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                          {item.submission_type} • by {item.author_profile?.full_name || item.author_profile?.username || item.author_id}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge pushed={item.is_pushed} status={item.moderation_status} />
                        <span className="text-[9px] font-bold text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{item.summary}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="px-4 py-2 rounded-xl border border-border text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/10 transition-all"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => togglePush(item)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${item.is_pushed ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'
                          }`}
                      >
                        {item.is_pushed ? 'Unpush' : 'Push'}
                      </button>

                      <button
                        onClick={() => removeItem('student_submissions', item.id)}
                        className="px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-xs font-black uppercase tracking-widest"
                      >
                        Delete
                      </button>

                      {item.content_url ? (
                        <a
                          href={item.content_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl border border-border text-xs font-black uppercase tracking-widest"
                        >
                          Open Link
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'payments' && (
          <section>
            {loading ? (
              <div className="h-56 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : paymentsList.length === 0 ? (
              <EmptyState text="No payments found." />
            ) : (
              <div className="space-y-3">
                {paymentsList.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-border bg-card flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black text-lg">₹{item.amount}</p>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          item.status === 'paid' ? 'bg-green-500/10 text-green-500' : 
                          item.status === 'unpaid' ? 'bg-destructive/10 text-destructive' : 
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1 mb-2">
                        {item.purpose?.toLowerCase().includes('[course]') && (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20">
                            Course
                          </span>
                        )}
                        {item.purpose?.toLowerCase().includes('[note]') && (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase tracking-widest border border-indigo-500/20">
                            Note
                          </span>
                        )}
                        {item.purpose?.toLowerCase().includes('[service]') && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 text-[8px] font-black uppercase tracking-widest border border-purple-500/20">
                            Service
                          </span>
                        )}
                        {item.purpose?.toLowerCase().includes('[academic]') && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                            Academic
                          </span>
                        )}
                        {item.purpose?.toLowerCase().includes('[cert]') && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20">
                            Certification
                          </span>
                        )}
                        {item.coupon_code && (
                          <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20">
                            Coupon: {item.coupon_code}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-foreground text-sm uppercase tracking-tight mb-1">
                        {item.purpose ? item.purpose.replace(/\[.*?\]\s*/g, '').trim() : ''}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        User: {item.user_profile?.full_name || item.user_profile?.username || 'Unknown'} • TXN ID: {item.transaction_id}
                      </p>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-muted-foreground border-t border-border/50 pt-2">
                        <div><strong className="text-white">Billing Name:</strong> {item.billing_name || 'N/A'}</div>
                        <div><strong className="text-white">Phone:</strong> {item.billing_phone || 'N/A'}</div>
                        <div><strong className="text-white">Email:</strong> {item.billing_email || 'N/A'}</div>
                        <div><strong className="text-white">UPI ID:</strong> {item.payer_upi_id || 'N/A'}</div>
                        <div className="sm:col-span-2"><strong className="text-white">Address:</strong> {item.billing_address ? `${item.billing_address}, ${item.billing_city}, ${item.billing_state} - ${item.billing_pin}` : 'N/A'}</div>
                        {item.coupon_code && (
                          <div className="sm:col-span-2 text-green-500 font-bold">
                            <strong className="text-white">Coupon Used:</strong> {item.coupon_code}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[9px] font-bold text-muted-foreground mb-2">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <GlassSelect
                          value={item.status || 'pending'}
                          onChange={(val) => updatePaymentStatus(item.id, val)}
                          options={[
                            { value: 'pending', label: 'Pending' },
                            { value: 'paid', label: 'Paid' },
                            { value: 'unpaid', label: 'Unpaid' }
                          ]}
                          className="w-32 h-9 text-xs"
                        />
                        <button
                          onClick={() => removeItem('payments', item.id)}
                          className="px-3 py-2 rounded-xl border border-destructive/40 text-destructive hover:bg-destructive/10 transition-all"
                          title="Delete payment"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'coupons' && (
          <section className="space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black italic tracking-tighter text-animate-gradient">Coupon Code Manager</h2>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Create, edit, and control discount coupon codes</p>
            </div>

            {/* Create / Edit Form */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-widest text-primary">
                  {couponEditId ? '✎ Edit Coupon' : '＋ New Coupon'}
                </h3>
                {couponEditId && (
                  <button onClick={cancelCouponEdit} className="text-xs font-black text-muted-foreground hover:text-white uppercase tracking-widest transition-colors">
                    Cancel
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Code */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Coupon Code</label>
                  <input
                    type="text"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-black uppercase tracking-widest outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Discount % */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Discount %</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.5"
                      value={couponForm.discount_pct}
                      onChange={(e) => setCouponForm(f => ({ ...f, discount_pct: e.target.value }))}
                      className="w-full h-11 bg-background border border-border rounded-xl px-4 pr-10 text-sm font-bold outline-none focus:border-primary transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">%</span>
                  </div>
                </div>

                {/* Min Amount */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Min. Bill Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={couponForm.min_amount}
                      onChange={(e) => setCouponForm(f => ({ ...f, min_amount: e.target.value }))}
                      className="w-full h-11 bg-background border border-border rounded-xl pl-8 pr-4 text-sm font-bold outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Applies To */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Applies To</label>
                  <GlassSelect
                    value={couponForm.applies_to}
                    onChange={(v) => setCouponForm(f => ({ ...f, applies_to: v }))}
                    options={[
                      { value: 'all', label: 'All Products' },
                      { value: 'course', label: 'Courses Only' },
                      { value: 'note', label: 'Notes Only' },
                      { value: 'service', label: 'Services Only' },
                      { value: 'academic', label: 'Academics Only' },
                    ]}
                    className="w-full h-11 text-sm"
                  />
                </div>

                {/* Never Expires Toggle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Expiry</label>
                  <button
                    type="button"
                    onClick={() => setCouponForm(f => ({ ...f, never_expires: !f.never_expires }))}
                    className={`w-full h-11 flex items-center gap-3 px-4 rounded-xl border font-black text-xs uppercase tracking-widest transition-all ${
                      couponForm.never_expires
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {couponForm.never_expires ? <Infinity size={16} /> : <Calendar size={16} />}
                    {couponForm.never_expires ? 'Never Expires' : 'Set Expiry Date'}
                  </button>
                </div>

                {/* Expires At */}
                {!couponForm.never_expires && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Expires At</label>
                    <input
                      type="datetime-local"
                      value={couponForm.expires_at}
                      onChange={(e) => setCouponForm(f => ({ ...f, expires_at: e.target.value }))}
                      className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-bold outline-none focus:border-primary transition-colors"
                    />
                  </div>
                )}

                {/* Usage Limit Toggle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Usage Limit</label>
                  <button
                    type="button"
                    onClick={() => setCouponForm(f => ({ ...f, is_infinite_uses: !f.is_infinite_uses }))}
                    className={`w-full h-11 flex items-center gap-3 px-4 rounded-xl border font-black text-xs uppercase tracking-widest transition-all ${
                      couponForm.is_infinite_uses
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-background border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {couponForm.is_infinite_uses ? <Infinity size={16} /> : <Users size={16} />}
                    {couponForm.is_infinite_uses ? 'Infinite Uses' : 'Limit Usage Count'}
                  </button>
                </div>

                {/* Max Uses */}
                {!couponForm.is_infinite_uses && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Max Times Redeemable</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 100"
                      value={couponForm.max_uses}
                      onChange={(e) => setCouponForm(f => ({ ...f, max_uses: e.target.value }))}
                      className="w-full h-11 bg-background border border-border rounded-xl px-4 text-sm font-bold outline-none focus:border-primary transition-colors text-white"
                    />
                  </div>
                )}

                {/* Active Toggle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</label>
                  <button
                    type="button"
                    onClick={() => setCouponForm(f => ({ ...f, is_active: !f.is_active }))}
                    className={`w-full h-11 flex items-center gap-3 px-4 rounded-xl border font-black text-xs uppercase tracking-widest transition-all ${
                      couponForm.is_active
                        ? 'bg-green-500/10 border-green-500/40 text-green-500'
                        : 'bg-destructive/10 border-destructive/40 text-destructive'
                    }`}
                  >
                    {couponForm.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {couponForm.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              {/* Preview */}
              {couponForm.code && (
                <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-widest">
                  <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 text-sm tracking-[0.3em]">{couponForm.code || '—'}</span>
                  <span className="text-green-500">{couponForm.discount_pct}% OFF</span>
                  <span className="text-muted-foreground">Min ₹{parseFloat(couponForm.min_amount || 0).toFixed(0)}</span>
                  <span className="text-muted-foreground">→ {couponForm.applies_to === 'all' ? 'All Products' : couponForm.applies_to}</span>
                  <span className={couponForm.is_active ? 'text-green-500' : 'text-destructive'}>{couponForm.is_active ? '● Active' : '● Inactive'}</span>
                  <span className="text-muted-foreground">{couponForm.never_expires ? '∞ Never Expires' : couponForm.expires_at ? `Expires ${new Date(couponForm.expires_at).toLocaleString()}` : 'No expiry set'}</span>
                  <span className="text-muted-foreground">{couponForm.is_infinite_uses ? '∞ Infinite Uses' : `Max Uses: ${couponForm.max_uses || '—'}`}</span>
                  <span className="text-muted-foreground">● Once Per User</span>
                </div>
              )}

              <button
                onClick={saveCoupon}
                disabled={couponSaving}
                className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {couponSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {couponEditId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>

            {/* Coupons List */}
            {loading ? (
              <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
            ) : couponsList.length === 0 ? (
              <EmptyState text="No coupon codes found. Create your first one above." />
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">{couponsList.length} Coupon{couponsList.length !== 1 ? 's' : ''}</p>
                {couponsList.map((c) => {
                  const isExpired = !c.never_expires && c.expires_at && new Date(c.expires_at) < new Date();
                  const isExhausted = c.max_uses !== null && c.max_uses !== undefined && c.uses_count >= c.max_uses;
                  return (
                    <div key={c.id} className={`p-5 rounded-2xl border bg-card flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${couponEditId === c.id ? 'border-primary/50 shadow-[0_0_24px_rgba(var(--primary-rgb),0.1)]' : 'border-border'}`}>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-base tracking-[0.25em] text-primary">{c.code}</span>
                          <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[9px] font-black uppercase tracking-widest border border-green-500/20">
                            {c.discount_pct}% OFF
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                            c.is_active && !isExpired && !isExhausted
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : 'bg-destructive/10 text-destructive border-destructive/20'
                          }`}>
                            {isExpired ? 'Expired' : isExhausted ? 'Exhausted' : c.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                            {c.applies_to === 'all' ? 'All' : c.applies_to}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-muted-foreground font-bold">
                          <span>Min Bill: ₹{parseFloat(c.min_amount || 0).toFixed(0)}</span>
                          <span className="flex items-center gap-1">
                            {c.never_expires ? <><Infinity size={10} /> Never Expires</> : isExpired ? `Expired ${new Date(c.expires_at).toLocaleString()}` : `Expires ${new Date(c.expires_at).toLocaleString()}`}
                          </span>
                          <span className="flex items-center gap-1">
                            Uses: {c.uses_count} / {c.max_uses !== null && c.max_uses !== undefined ? c.max_uses : '∞'}
                          </span>
                          <span>Created {new Date(c.created_at).toLocaleDateString()}</span>
                          <span>• Once Per User</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEditCoupon(c)}
                          className="px-4 py-2 rounded-xl border border-border hover:border-primary/40 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                        >
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => deleteCoupon(c.id)}
                          className="px-4 py-2 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'workflow_designer' && (
          <section className="space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-black italic tracking-tighter text-animate-gradient">Workflow Architect</h2>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Engineer dynamic intake pipelines and service logic</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 px-2">Select Pipeline to Engineer</p>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  {tableData.length === 0 && (
                    <button
                      onClick={() => fetchTable('services')}
                      className="w-full p-6 rounded-3xl border border-dashed border-border hover:border-primary/50 transition-all text-xs font-bold text-muted-foreground"
                    >
                      Load Services
                    </button>
                  )}
                  {tableData.map(service => (
                    <button
                      key={service.id}
                      onClick={() => setEditingItem(service)}
                      className={`w-full p-5 rounded-3xl border transition-all text-left group flex items-center justify-between ${editingItem?.id === service.id ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]' : 'bg-card border-border hover:border-primary/40'}`}
                    >
                      <div>
                        <p className={`font-black text-sm uppercase tracking-wider ${editingItem?.id === service.id ? 'text-primary' : ''}`}>{service.title}</p>
                        <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-widest">{service.category || 'General'}</p>
                      </div>
                      <ChevronRight size={16} className={`transition-transform ${editingItem?.id === service.id ? 'translate-x-1 text-primary' : 'text-muted-foreground'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                {editingItem ? (
                  <div className="space-y-6">
                    <div className="p-8 rounded-[48px] bg-card border border-border shadow-2xl space-y-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter italic">{editingItem.title}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Pipeline Configuration</p>
                        </div>
                        <button
                          onClick={async () => {
                            setLoading(true);
                            const { error } = await adminSupabase
                              .from('services')
                              .update({ extra_details: editingItem.extra_details })
                              .eq('id', editingItem.id);

                            if (error) showAlert(error.message, 'error');
                            else {
                              showAlert('Workflow Pipeline Synchronized', 'success');
                              fetchTable('services');
                            }
                            setLoading(false);
                          }}
                          disabled={loading}
                          className="px-8 py-4 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                          {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Save Pipeline
                        </button>
                      </div>

                      <ServiceWorkflowEditor
                        value={editingItem.extra_details?.form_config}
                        onChange={(newConfig) => {
                          setEditingItem({
                            ...editingItem,
                            extra_details: {
                              ...(editingItem.extra_details || {}),
                              form_config: newConfig
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-[50vh] flex flex-col items-center justify-center text-center p-12 rounded-[48px] border-2 border-dashed border-border bg-muted/10">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <Settings size={32} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic">Select a Pipeline</h3>
                    <p className="text-xs text-muted-foreground max-w-xs font-medium">Engineer the fields, tiers, and logical workflows for your service intake system.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {isModalOpen && (CONTENT_TABLES.some((t) => t.id === activeTab) || activeTab === 'users' || activeTab === 'student_submissions' || activeTab === 'service_inquiries') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl bg-card border border-border/60 sm:rounded-[48px] rounded-none shadow-[0_0_80px_-20px_rgba(0,0,0,0.5)] relative z-10 max-h-screen sm:max-h-[85vh] flex flex-col overflow-hidden"
          >
            <div className="p-10 border-b border-border/40 flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter text-animate-gradient">{editingItem ? 'Edit Entry' : 'New Entry'}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Configure {activeTab} data points</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 rounded-full hover:bg-background border border-border transition-all hover:scale-110"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar" data-lenis-prevent="true">
              <AdminForm
                key={editingItem ? editingItem.id : 'new'}
                table={activeTab}
                initialData={editingItem}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={() => {
                  setIsModalOpen(false);
                  if (activeTab === 'users') {
                    fetchUsers();
                  } else if (activeTab === 'student_submissions') {
                    fetchSubmissions();
                  } else {
                    fetchTable(activeTab);
                  }
                  fetchStats();
                }}
                adminId={adminUser?.id}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const StudentAcademicEditor = ({ value, onChange }) => {
  const [tasks, setTasks] = useState(Array.isArray(value) ? value : []);

  const update = (newTasks) => {
    setTasks(newTasks);
    onChange(newTasks);
  };

  const addTask = () => {
    update([...tasks, { title: 'New Task', deadline: 'TBD', status: 'Pending' }]);
  };

  return (
    <div className="space-y-4 p-5 rounded-3xl bg-muted/20 border border-border/50">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Academic Tasks Manifesto</h4>
        <button type="button" onClick={addTask} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
          <Plus size={14} />
        </button>
      </div>
      
      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-background border border-border/50 space-y-3 relative group">
            <button 
              type="button" 
              onClick={() => update(tasks.filter((_, i) => i !== idx))}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded-md transition-all"
            >
              <Trash2 size={12} />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest opacity-50">Task Title</label>
                <input
                  value={task.title}
                  onChange={e => {
                    const n = [...tasks];
                    n[idx].title = e.target.value;
                    update(n);
                  }}
                  className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-[11px] font-bold py-1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest opacity-50">Deadline / Date</label>
                <input
                  value={task.deadline}
                  onChange={e => {
                    const n = [...tasks];
                    n[idx].deadline = e.target.value;
                    update(n);
                  }}
                  className="w-full bg-transparent border-b border-border focus:border-primary outline-none text-[11px] font-bold py-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Initial Status:</span>
              <GlassSelect
                value={task.status || 'Pending'}
                onChange={val => {
                  const n = [...tasks];
                  n[idx].status = val;
                  update(n);
                }}
                options={['Pending', 'In Progress', 'Done']}
                className="w-28 h-7 text-[9px]"
              />
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-[10px] text-muted-foreground italic text-center py-4">No tasks assigned.</p>}
      </div>
    </div>
  );
};

const JSONFieldEditor = ({ value, onChange, label }) => {
  const [text, setText] = useState(() => {
    try {
      return value ? JSON.stringify(value, null, 2) : '';
    } catch {
      return '';
    }
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    if (!val.trim()) {
      onChange(null);
      setError('');
      return;
    }
    try {
      const parsed = JSON.parse(val);
      onChange(parsed);
      setError('');
    } catch (err) {
      setError('Invalid JSON');
    }
  };

  return (
    <div className="space-y-2 p-4 rounded-2xl bg-muted/30 border border-border/50 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
        {error && <span className="text-[10px] font-black text-destructive uppercase bg-destructive/10 px-2 py-0.5 rounded-md">{error}</span>}
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder='{"key": ["value1", "value2"]}'
        className={`w-full min-h-[120px] max-h-64 px-4 py-3 rounded-xl bg-background border ${error ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'} outline-none overflow-y-auto custom-scrollbar resize-y font-mono text-xs`}
        data-lenis-prevent="true"
        spellCheck="false"
      />
    </div>
  );
};

const ServiceWorkflowEditor = ({ value, onChange }) => {
  const [config, setConfig] = useState(value || {
    tiers: [],
    tierMultipliers: {},
    addons: [],
    custom_fields: []
  });

  const [dialog, setDialog] = useState(null); // { type, title, inputs: [] }
  const [dialogData, setDialogData] = useState({});

  const update = (newConfig) => {
    setConfig(newConfig);
    onChange(newConfig);
  };

  const addTier = () => {
    setDialog({
      type: 'tier',
      title: 'Architectural Tier',
      fields: [
        { name: 'name', label: 'Tier Name', placeholder: 'e.g. Diamond Elite', type: 'text' }
      ]
    });
    setDialogData({ name: '' });
  };

  const addAddon = () => {
    setDialog({
      type: 'addon',
      title: 'Strategic Add-on',
      fields: [
        { name: 'label', label: 'Add-on Title', placeholder: 'e.g. Express Delivery', type: 'text' },
        { name: 'price', label: 'Fixed Price (₹)', placeholder: '5000', type: 'number' }
      ]
    });
    setDialogData({ label: '', price: 0 });
  };

  const addField = () => {
    setDialog({
      type: 'field',
      title: 'Intelligence Field',
      fields: [
        { name: 'label', label: 'Field Label', placeholder: 'e.g. Company Website', type: 'text' }
      ]
    });
    setDialogData({ label: '' });
  };

  const handleDialogSubmit = () => {
    if (dialog.type === 'tier') {
      const { name } = dialogData;
      if (!name) return;
      update({
        ...config,
        tiers: [...(config.tiers || []), name],
        tierMultipliers: { ...(config.tierMultipliers || {}), [name]: 1 }
      });
    } else if (dialog.type === 'addon') {
      const { label, price } = dialogData;
      if (!label) return;
      const id = label.toLowerCase().replace(/\s+/g, '_');
      update({
        ...config,
        addons: [...(config.addons || []), { id, label, price: parseInt(price) || 0 }]
      });
    } else if (dialog.type === 'field') {
      const { label } = dialogData;
      if (!label) return;
      const name = label.toLowerCase().replace(/\s+/g, '_');
      update({
        ...config,
        custom_fields: [...(config.custom_fields || []), {
          name,
          label,
          type: 'text',
          required: false,
          placeholder: ''
        }]
      });
    }
    setDialog(null);
  };

  return (
    <div className="space-y-6 p-6 rounded-[32px] bg-muted/20 border border-border/50">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Workflow & Logic Architect</h4>
        <button
          type="button"
          onClick={() => update({ tiers: [], tierMultipliers: {}, addons: [], custom_fields: [] })}
          className="text-[10px] font-bold text-destructive hover:underline"
        >
          Reset Config
        </button>
      </div>

      <div className="space-y-3 pb-4 border-b border-border/30">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Specialized Logic Template</label>
        <GlassSelect
          value={config.specialized_template || ''}
          onChange={val => update({ ...config, specialized_template: val })}
          options={[
            { value: '', label: 'Standard (Tiers & Addons)' },
            { value: 'mock_exams', label: 'Mock & Rock (Exams/Subjects)' },
            { value: 'project_doc', label: 'Project Documentation (Word/LaTeX)' },
            { value: 'thesis_doc', label: 'Thesis Documentation (Page Ranges)' },
            { value: 'poster_design', label: 'Poster Design (Standard/Premium)' },
            { value: 'album_layout', label: 'Album Layout (Standard/Premium)' },
            { value: 'desktop_design', label: 'Desktop Personalization (Setups)' }
          ]}
        />
        <p className="text-[8px] font-medium text-muted-foreground italic">Selecting a template enables specialized input fields and pricing calculators in the service request form.</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Service Tiers & Multipliers</p>
          <button type="button" onClick={addTier} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
            <Plus size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(config.tiers || []).map(tier => (
            <div key={tier} className="p-3 rounded-xl bg-background border border-border/50 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest truncate">{tier}</span>
                <button type="button" onClick={() => update({ ...config, tiers: config.tiers.filter(t => t !== tier) })} className="text-destructive"><X size={12} /></button>
              </div>
              <input
                type="number"
                step="0.1"
                placeholder="Multiplier"
                value={config.tierMultipliers?.[tier] || 1}
                onChange={e => update({ ...config, tierMultipliers: { ...config.tierMultipliers, [tier]: parseFloat(e.target.value) } })}
                className="w-full bg-muted/30 px-3 py-1.5 rounded-lg text-xs outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Optional Add-ons</p>
          <button type="button" onClick={addAddon} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-2">
          {(config.addons || []).map((addon, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-background border border-border/50 flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest">{addon.label}</p>
                <p className="text-[10px] text-muted-foreground">₹{addon.price}</p>
              </div>
              <button type="button" onClick={() => update({ ...config, addons: config.addons.filter((_, i) => i !== idx) })} className="text-destructive"><X size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dynamic Workflow Fields</p>
          <button type="button" onClick={addField} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-2">
          {(config.custom_fields || []).map((field, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-background border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  value={field.label}
                  onChange={e => {
                    const newFields = [...config.custom_fields];
                    newFields[idx].label = e.target.value;
                    update({ ...config, custom_fields: newFields });
                  }}
                  className="bg-transparent font-black uppercase tracking-widest text-[10px] outline-none text-primary"
                />
                <button type="button" onClick={() => update({ ...config, custom_fields: config.custom_fields.filter((_, i) => i !== idx) })} className="text-destructive"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <GlassSelect
                  value={field.type}
                  onChange={val => {
                    const newFields = [...config.custom_fields];
                    newFields[idx].type = val;
                    update({ ...config, custom_fields: newFields });
                  }}
                  options={[
                    { value: 'text', label: 'Text Input' },
                    { value: 'textarea', label: 'Large Text' },
                    { value: 'select', label: 'Dropdown' }
                  ]}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newFields = [...config.custom_fields];
                    newFields[idx].required = !newFields[idx].required;
                    update({ ...config, custom_fields: newFields });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${field.required ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-muted/30 text-muted-foreground border border-transparent'}`}
                >
                  {field.required ? 'Required' : 'Optional'}
                </button>
              </div>
              {field.type === 'select' && (
                <input
                  placeholder="Options (Comma separated)"
                  value={field.options?.join(', ') || ''}
                  onChange={e => {
                    const newFields = [...config.custom_fields];
                    newFields[idx].options = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    update({ ...config, custom_fields: newFields });
                  }}
                  className="w-full bg-muted/30 px-3 py-1.5 rounded-lg text-[10px] font-medium outline-none"
                />
              )}

              <div className="pt-2 border-t border-border/30">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Visibility Logic (showIf)</p>
                <div className="grid grid-cols-2 gap-2">
                  <GlassSelect
                    value={field.showIf?.field || ''}
                    onChange={val => {
                      const newFields = [...config.custom_fields];
                      if (!val) {
                        delete newFields[idx].showIf;
                      } else {
                        newFields[idx].showIf = { field: val, value: '' };
                      }
                      update({ ...config, custom_fields: newFields });
                    }}
                    options={[
                      { value: '', label: 'Always Visible' },
                      { value: 'tier', label: 'Based on Tier' },
                      ...config.custom_fields.filter((_, i) => i < idx).map(f => ({
                        value: f.name,
                        label: `Based on ${f.label}`
                      }))
                    ]}
                  />
                  {field.showIf && (
                    <input
                      placeholder="Show if value is..."
                      value={field.showIf.value}
                      onChange={e => {
                        const newFields = [...config.custom_fields];
                        newFields[idx].showIf.value = e.target.value;
                        update({ ...config, custom_fields: newFields });
                      }}
                      className="bg-muted/30 px-3 py-1.5 rounded-lg text-[9px] font-medium outline-none"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {dialog && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/60 backdrop-blur-3xl pointer-events-auto"
              onClick={() => setDialog(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-card border border-border rounded-[40px] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative z-10 pointer-events-auto"
            >
              <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Build <span className="text-primary">{dialog.title}</span></h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8">Architect the specific data point parameters</p>

              <div className="space-y-6 mb-10">
                {dialog.fields.map(f => (
                  <div key={f.name} className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={dialogData[f.name] || ''}
                      onChange={e => setDialogData({ ...dialogData, [f.name]: e.target.value })}
                      autoFocus={f.name === dialog.fields[0].name}
                      onKeyDown={e => e.key === 'Enter' && handleDialogSubmit()}
                      className="w-full bg-muted/30 px-5 py-4 rounded-2xl text-sm font-bold border border-transparent focus:border-primary/30 focus:bg-background outline-none transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDialog(null)}
                  className="px-6 py-4 rounded-2xl border border-border font-black uppercase tracking-widest text-[9px] hover:bg-muted/50 transition-all active:scale-95"
                >
                  Abort
                </button>
                <button
                  onClick={handleDialogSubmit}
                  className="px-6 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[9px] hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminImageField = ({ value, onChange, label, adminId }) => {
  const { showAlert } = useAlert();
  const [uploading, setUploading] = useState(false);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`;
      const filePath = adminId ? `${adminId}/admin/${fileName}` : `admin/${fileName}`;

      const { error: uploadError } = await adminSupabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = adminSupabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err) {
      showAlert('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      <div className="flex flex-col gap-3">
        {value && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-muted group">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste Image URL"
            className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
          />
          <label className={`cursor-pointer px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted transition-all flex items-center gap-2 text-xs font-bold ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            <span>{uploading ? '...' : 'Upload'}</span>
            <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, required, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
      {label} {required ? '*' : ''}
    </label>
    {children}
  </div>
);

const MessageBox = ({ type, children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -10 }}
    animate={{ 
      opacity: 1, 
      scale: 1, 
      y: 0,
      x: type === 'error' ? [0, -6, 6, -6, 6, -3, 3, 0] : 0
    }}
    transition={{ duration: 0.4 }}
    className={`p-4 rounded-2xl border text-sm font-semibold flex items-start gap-3 backdrop-blur-md relative overflow-hidden ${
      type === 'success'
        ? 'border-green-500/20 bg-green-500/5 text-green-600 dark:text-green-400 shadow-[0_4px_20px_rgba(34,197,94,0.05)] border-l-4 border-l-green-500'
        : 'border-destructive/20 bg-destructive/5 text-destructive shadow-[0_4px_20px_rgba(239,68,68,0.05)] border-l-4 border-l-destructive'
    }`}
  >
    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center relative ${
      type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
    }`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
    </div>
    <div className="flex-1 pt-1.5 leading-tight text-left">
      <span className="block text-[8px] font-black uppercase tracking-widest opacity-50 mb-0.5">
        {type === 'success' ? 'TRANSACTION COMPLETE / SUCCESS' : 'SYSTEM EXCEPTION / WARNING'}
      </span>
      {children}
    </div>
  </motion.div>
);

const EmptyState = ({ text }) => (
  <div className="h-56 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
    {text}
  </div>
);

const StatusBadge = ({ pushed, status }) => (
  <span
    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pushed
      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
      : status === 'unpushed'
        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
      }`}
  >
    {pushed ? 'Pushed' : status === 'unpushed' ? 'Unpushed' : 'On Hold'}
  </span>
);

const htmlToMarkdown = (html) => {
  if (!html) return '';
  let md = html;
  
  // 1. Replace plain block/paragraph/divisions (without attributes) with newlines
  md = md.replace(/<p\s*>/gi, '').replace(/<\/p\s*>/gi, '\n\n');
  md = md.replace(/<div\s*>/gi, '').replace(/<\/div\s*>/gi, '\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  
  // Headers
  md = md.replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n');
  
  // Lists
  md = md.replace(/<ul>/gi, '').replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol>/gi, '').replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li>(.*?)<\/li>/gi, '- $1\n');
  
  // Bold, Italic, Underline, Code, Link, Strike, blockquotes
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<u>(.*?)<\/u>/gi, '_$1_');
  md = md.replace(/<strike>(.*?)<\/strike>/gi, '~~$1~~');
  md = md.replace(/<s>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<code>(.*?)<\/code>/gi, '`$1`');
  md = md.replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
  md = md.replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n\n');

  // 2. Keep all styled tags (span, font, div, p with any styling/alignment attributes) by replacing with placeholders
  const preservedTags = [];
  md = md.replace(/<(span|font|div|p)\s+([^>]+)>/gi, (match, tagName, attrs) => {
    preservedTags.push(`<${tagName} ${attrs}>`);
    return `__PRESERVED_TAG_START_${preservedTags.length - 1}__`;
  });
  
  md = md.replace(/<\/span>/gi, '__SPAN_END__');
  md = md.replace(/<\/font>/gi, '__FONT_END__');
  md = md.replace(/<\/div>/gi, '__DIV_END__');
  md = md.replace(/<\/p>/gi, '__P_END__');
  md = md.replace(/<sub>/gi, '__SUB_START__');
  md = md.replace(/<\/sub>/gi, '__SUB_END__');
  md = md.replace(/<sup>/gi, '__SUP_START__');
  md = md.replace(/<\/sup>/gi, '__SUP_END__');
  md = md.replace(/<hr\s*\/?>/gi, '__HR__');

  // 3. Clean remaining tags
  md = md.replace(/<[^>]+>/g, '');

  // 4. Restore preserved tags
  preservedTags.forEach((tagString, index) => {
    md = md.replace(new RegExp(`__PRESERVED_TAG_START_${index}__`, 'g'), tagString);
  });
  md = md.replace(/__SPAN_END__/g, '</span>');
  md = md.replace(/__FONT_END__/g, '</font>');
  md = md.replace(/__DIV_END__/g, '</div>');
  md = md.replace(/__P_END__/g, '</p>');
  md = md.replace(/__SUB_START__/g, '<sub>');
  md = md.replace(/__SUB_END__/g, '</sub>');
  md = md.replace(/__SUP_START__/g, '<sup>');
  md = md.replace(/__SUP_END__/g, '</sup>');
  md = md.replace(/__HR__/g, '<hr />');

  // 5. Decode spacing/punctuation HTML entities safely
  md = md
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  
  // Clean up excessive newlines
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
};

const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  
  let normalized = markdown
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  const blocks = normalized.split(/\n\n+/);
  const result = [];

  blocks.forEach(block => {
    let trimmed = block.trim();
    if (!trimmed) return;

    trimmed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    trimmed = trimmed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    trimmed = trimmed.replace(/_(.*?)_/g, '<u>$1</u>');
    trimmed = trimmed.replace(/~~(.*?)~~/g, '<strike>$1</strike>');
    trimmed = trimmed.replace(/`(.*?)`/g, '<code>$1</code>');
    trimmed = trimmed.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    if (trimmed.startsWith('# ')) {
      result.push(`<h1>${trimmed.substring(2)}</h1>`);
    } else if (trimmed.startsWith('## ')) {
      result.push(`<h2>${trimmed.substring(3)}</h2>`);
    } else if (trimmed.startsWith('### ')) {
      result.push(`<h3>${trimmed.substring(4)}</h3>`);
    } else if (trimmed.startsWith('> ')) {
      result.push(`<blockquote>${trimmed.substring(2)}</blockquote>`);
    } else if (trimmed.startsWith('---')) {
      result.push('<hr />');
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split(/\n[-*]\s+/);
      const liElements = items.map(item => {
        const cleaned = item.replace(/^[-*]\s+/, '');
        return `<li>${cleaned}</li>`;
      }).join('');
      result.push(`<ul>${liElements}</ul>`);
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const items = trimmed.split(/\n\d+\.\s+/);
      const liElements = items.map(item => {
        const cleaned = item.replace(/^\d+\.\s+/, '');
        return `<li>${cleaned}</li>`;
      }).join('');
      result.push(`<ol>${liElements}</ol>`);
    } else {
      const isHtmlBlock = /^\s*<(p|div|h1|h2|h3|blockquote|ul|ol|hr)\b/i.test(trimmed);
      if (isHtmlBlock) {
        result.push(trimmed);
      } else {
        const parsedLines = trimmed.split('\n').join('<br />');
        result.push(`<p>${parsedLines}</p>`);
      }
    }
  });

  return result.join('');
};

const CustomPromptModal = ({ isOpen, title, message, placeholder, value, onChange, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-md p-6 rounded-[28px] border border-white/10 bg-card/85 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1">
          <h4 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Sparkles size={16} className="text-primary animate-pulse" />
            {title}
          </h4>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            {message}
          </p>
        </div>

        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onConfirm();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              onCancel();
            }
          }}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-xs text-foreground transition-all"
          autoFocus
        />

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-border hover:bg-muted/10 text-xs font-black uppercase tracking-wider text-muted-foreground transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-[1px] active:translate-y-0 transition-all cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const RichWordEditor = ({ value, onChange, placeholder = 'Type description here...' }) => {
  const editorRef = React.useRef(null);
  const [promptState, setPromptState] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    value: '',
    resolve: null
  });

  const [activeColor, setActiveColor] = React.useState('#ffffff');
  const [activeHighlight, setActiveHighlight] = React.useState('transparent');
  const [activeSize, setActiveSize] = React.useState('3');
  const [activeFont, setActiveFont] = React.useState('Inter');

  const [showColorDropdown, setShowColorDropdown] = React.useState(false);
  const [showHighlightDropdown, setShowHighlightDropdown] = React.useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = React.useState(false);
  const [showFontDropdown, setShowFontDropdown] = React.useState(false);

  const colors = [
    { name: 'Purple', hex: '#b512ff', bg: '#b512ff' },
    { name: 'Blue', hex: '#3b82f6', bg: '#3b82f6' },
    { name: 'Green', hex: '#10b981', bg: '#10b981' },
    { name: 'Gold', hex: '#f59e0b', bg: '#f59e0b' },
    { name: 'Red', hex: '#f43f5e', bg: '#f43f5e' },
    { name: 'White', hex: '#ffffff', bg: '#ffffff' },
    { name: 'Gray', hex: '#94a3b8', bg: '#94a3b8' }
  ];

  const highlights = [
    { name: 'Yellow Highlight', value: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
    { name: 'Green Highlight', value: 'rgba(16,185,129,0.3)', color: '#10b981' },
    { name: 'Purple Highlight', value: 'rgba(181,18,255,0.3)', color: '#b512ff' },
    { name: 'Blue Highlight', value: 'rgba(59,130,246,0.3)', color: '#3b82f6' },
    { name: 'No Highlight', value: 'transparent', color: '#94a3b8' }
  ];

  const fontSizes = [
    { label: 'Small', val: '2' },
    { label: 'Normal', val: '3' },
    { label: 'Large', val: '5' },
    { label: 'Heading', val: '6' }
  ];

  const fontFamilies = [
    { label: 'Sans-Serif', val: 'Inter, sans-serif' },
    { label: 'Serif', val: 'Georgia, serif' },
    { label: 'Monospace', val: 'Fira Code, monospace' }
  ];

  const showCustomPrompt = (title, message, placeholder = '', defaultValue = '') => {
    return new Promise((resolve) => {
      setPromptState({
        isOpen: true,
        title,
        message,
        placeholder,
        value: defaultValue,
        resolve
      });
    });
  };

  const handleConfirm = () => {
    if (promptState.resolve) {
      promptState.resolve(promptState.value);
    }
    setPromptState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (promptState.resolve) {
      promptState.resolve(null);
    }
    setPromptState(prev => ({ ...prev, isOpen: false }));
  };
  
  React.useEffect(() => {
    if (editorRef.current) {
      const currentHtml = editorRef.current.innerHTML;
      const expectedHtml = markdownToHtml(value);
      if (htmlToMarkdown(currentHtml) !== htmlToMarkdown(expectedHtml)) {
        editorRef.current.innerHTML = expectedHtml || `<p><br></p>`;
      }
    }
  }, [value]);

  const exec = (command, arg = null) => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const md = htmlToMarkdown(html);
      onChange(md);
    }
  };

  const addLink = async () => {
    const url = await showCustomPrompt('Insert Link', 'Enter the link URL:', 'https://');
    if (url) exec('createLink', url);
  };

  return (
    <div className="border border-border/60 rounded-3xl overflow-hidden bg-background shadow-inner flex flex-col min-h-[300px]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-3 bg-muted/20 border-b border-border/40 relative z-30 select-none">
        
        {/* Undo / Redo */}
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('undo'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Undo"><Undo size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('redo'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Redo"><Redo size={14} /></button>
        
        <div className="w-[1px] h-4 bg-border/60 mx-1" />

        {/* Basic styles */}
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Bold"><Bold size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('italic'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Italic"><Italic size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('underline'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Underline"><Underline size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('strikeThrough'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Strikethrough"><Strikethrough size={14} /></button>
        
        <div className="w-[1px] h-4 bg-border/60 mx-1" />

        {/* Super / Sub */}
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('superscript'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Superscript"><Superscript size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('subscript'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Subscript"><Subscript size={14} /></button>

        <div className="w-[1px] h-4 bg-border/60 mx-1" />

        {/* Font Family Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onMouseDown={(e) => { e.preventDefault(); setShowFontDropdown(!showFontDropdown); setShowColorDropdown(false); setShowHighlightDropdown(false); setShowSizeDropdown(false); }} 
            className="px-2.5 py-1.5 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Font Family"
          >
            <span className="max-w-[70px] truncate">{fontFamilies.find(f => f.val === activeFont)?.label || 'Font'}</span>
            <span className="text-[9px] opacity-60">▼</span>
          </button>
          {showFontDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-36 py-1.5 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col">
              {fontFamilies.map((ff) => (
                <button
                  key={ff.val}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec('fontName', ff.val);
                    setActiveFont(ff.val);
                    setShowFontDropdown(false);
                  }}
                  className="px-3 py-1.5 text-left text-[11px] text-foreground hover:bg-muted/10 transition-all font-bold"
                  style={{ fontFamily: ff.val }}
                >
                  {ff.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onMouseDown={(e) => { e.preventDefault(); setShowSizeDropdown(!showSizeDropdown); setShowColorDropdown(false); setShowHighlightDropdown(false); setShowFontDropdown(false); }} 
            className="px-2.5 py-1.5 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            title="Font Size"
          >
            <span>{fontSizes.find(s => s.val === activeSize)?.label || 'Size'}</span>
            <span className="text-[9px] opacity-60">▼</span>
          </button>
          {showSizeDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-28 py-1.5 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl z-50 flex flex-col">
              {fontSizes.map((sz) => (
                <button
                  key={sz.val}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec('fontSize', sz.val);
                    setActiveSize(sz.val);
                    setShowSizeDropdown(false);
                  }}
                  className="px-3 py-1.5 text-left text-[11px] text-foreground hover:bg-muted/10 transition-all font-bold"
                >
                  {sz.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-border/60 mx-1" />

        {/* Font Color Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onMouseDown={(e) => { e.preventDefault(); setShowColorDropdown(!showColorDropdown); setShowHighlightDropdown(false); setShowSizeDropdown(false); setShowFontDropdown(false); }} 
            className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
            title="Text Color"
          >
            <Palette size={14} style={{ color: activeColor }} />
          </button>
          {showColorDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-40 p-2.5 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl z-50 flex flex-wrap gap-1.5 justify-center">
              {colors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec('foreColor', c.hex);
                    setActiveColor(c.hex);
                    setShowColorDropdown(false);
                  }}
                  className="w-6 h-6 rounded-lg transition-all border border-white/10 hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                  style={{ backgroundColor: c.bg }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Highlight Color Dropdown */}
        <div className="relative">
          <button 
            type="button" 
            onMouseDown={(e) => { e.preventDefault(); setShowHighlightDropdown(!showHighlightDropdown); setShowColorDropdown(false); setShowSizeDropdown(false); setShowFontDropdown(false); }} 
            className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
            title="Highlight Color"
          >
            <Highlighter size={14} style={{ color: activeHighlight !== 'transparent' ? activeHighlight : '#ffffff' }} />
          </button>
          {showHighlightDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-44 p-2.5 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl z-50 flex flex-wrap gap-1.5 justify-center">
              {highlights.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    exec('hiliteColor', h.value);
                    exec('backColor', h.value);
                    setActiveHighlight(h.value);
                    setShowHighlightDropdown(false);
                  }}
                  className="w-6 h-6 rounded-lg transition-all border border-white/10 hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                  style={{ backgroundColor: h.value === 'transparent' ? '#ffffff' : h.value, color: h.value === 'transparent' ? '#000000' : 'transparent' }}
                  title={h.name}
                >
                  {h.value === 'transparent' && '❌'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-4 bg-border/60 mx-1" />

        {/* Paragraph Headings Block Types */}
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', '<h1>'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all font-black cursor-pointer" title="H1"><Heading1 size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', '<h2>'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all font-black cursor-pointer" title="H2"><Heading2 size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', '<blockquote>'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Blockquote"><Quote size={14} /></button>

        <div className="w-[1px] h-4 bg-border/60 mx-1" />

        {/* Lists & Alignment */}
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Unordered List"><List size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Ordered List"><ListOrdered size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Align Left"><AlignLeft size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Align Center"><AlignCenter size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyRight'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Align Right"><AlignRight size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyFull'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Align Justify"><AlignJustify size={14} /></button>

        <div className="w-[1px] h-4 bg-border/60 mx-1" />

        {/* Insert items */}
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('insertHorizontalRule'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Horizontal Line"><Minus size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); }} onClick={addLink} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-foreground transition-all cursor-pointer" title="Link"><Link size={14} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('removeFormat'); }} className="p-2 rounded-xl hover:bg-background border border-transparent hover:border-border text-destructive transition-all ml-auto cursor-pointer" title="Clear Formatting"><Eraser size={14} /></button>
      </div>

      {/* MS Word Paper Area */}
      <div 
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 p-6 outline-none bg-card min-h-[220px] prose prose-invert max-w-none text-sm text-foreground/80 overflow-y-auto custom-scrollbar focus:ring-1 focus:ring-primary/20"
        placeholder={placeholder}
        style={{
          minHeight: '220px',
        }}
      />

      <CustomPromptModal
        isOpen={promptState.isOpen}
        title={promptState.title}
        message={promptState.message}
        placeholder={promptState.placeholder}
        value={promptState.value}
        onChange={(val) => setPromptState(prev => ({ ...prev, value: val }))}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

const AdminForm = ({ table, initialData, onSuccess, onCancel, adminId }) => {
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState(() => {
    if (!initialData) return {};
    let normalized = { ...initialData };
    // Ensure extra_details is an object if it comes back as a string
    if (typeof normalized.extra_details === 'string') {
      try {
        normalized.extra_details = JSON.parse(normalized.extra_details);
        if (typeof normalized.extra_details !== 'object' || normalized.extra_details === null) {
          normalized.extra_details = {};
        }
      } catch {
        normalized.extra_details = {};
      }
    } else if (!normalized.extra_details) {
      normalized.extra_details = {};
    }
    return normalized;
  });
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFieldLoading, setAiFieldLoading] = useState({});

  const [promptState, setPromptState] = useState({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    value: '',
    resolve: null
  });

  const showCustomPrompt = (title, message, placeholder = '', defaultValue = '') => {
    return new Promise((resolve) => {
      setPromptState({
        isOpen: true,
        title,
        message,
        placeholder,
        value: defaultValue,
        resolve
      });
    });
  };

  const handleConfirm = () => {
    if (promptState.resolve) {
      promptState.resolve(promptState.value);
    }
    setPromptState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (promptState.resolve) {
      promptState.resolve(null);
    }
    setPromptState(prev => ({ ...prev, isOpen: false }));
  };

  const handleFieldAIGenerate = async (fieldName, fieldLabel, fieldType) => {
    const instruction = await showCustomPrompt(
      '✨ AI Field Generator',
      `Enter brief topic or guidance to generate "${fieldLabel}" (or leave blank to auto-generate based on existing fields):`,
      'e.g. advanced technology concepts'
    );
    if (instruction === null) return;
    
    setAiFieldLoading(prev => ({ ...prev, [fieldName]: true }));
    try {
      if (fieldName.includes('image') || fieldName.includes('thumbnail') || fieldName.includes('cover')) {
        const seed = Math.floor(Math.random() * 1000000);
        const nameVal = getValue('name') || getValue('title') || 'illustration';
        const imagePromptText = instruction || `premium futuristic tech graphics for 5EVEN ${table} ${nameVal} - ${fieldLabel}, cinematic lighting, 3d octane render, glowing dark purple neon highlights, 8k`;
        const url = `https://image.pollinations.ai/p/${encodeURIComponent(imagePromptText.substring(0, 150))}?width=800&height=600&nologo=true&seed=${seed}`;
        setValue(fieldName, url);
        showAlert(`Generated cover image for ${fieldLabel}`, 'success');
        return;
      }

      const contextList = [];
      fields.forEach(f => {
        const val = getValue(f.name);
        if (val && f.name !== fieldName && typeof val !== 'object') {
          contextList.push(`${f.label}: ${val}`);
        }
      });
      const contextStr = contextList.join('\n');

      const systemPrompt = `You are a premium AI database assistant for "5EVEN" (a futuristic cybernetic college & services portal).
Task: Generate a professional, high-fidelity value for the field "${fieldLabel}" inside the database table "${table}".
${instruction ? `Specific Guidance: "${instruction}"` : ''}

Context of other form fields:
${contextStr}

${fieldType === 'string_array' ? 'Return the response as a comma-separated list of short bullet items. Do not use numbering or brackets.' : 'Return ONLY the plain text value for the field. Avoid conversational headers, extra markdown codes, or quotation marks.'}`;

      const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(systemPrompt)}`);
      if (!res.ok) throw new Error("Could not reach AI engine");
      
      let text = await res.text();
      let cleaned = text.trim();
      
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) cleaned = cleaned.slice(1, -1);
      if (cleaned.startsWith("'") && cleaned.endsWith("'")) cleaned = cleaned.slice(1, -1);
      
      if (fieldType === 'string_array') {
        const arr = cleaned.split(',').map(s => s.trim().replace(/^[-*]\s+/, '')).filter(Boolean);
        setValue(fieldName, arr);
      } else {
        setValue(fieldName, cleaned);
      }
      showAlert(`AI generated value for ${fieldLabel}`, 'success');
    } catch (err) {
      console.error(err);
      showAlert(`AI generation failed: ${err.message}`, 'error');
    } finally {
      setAiFieldLoading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      showAlert('Please enter a description for the AI', 'error');
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await adminSupabase.functions.invoke('generate-ai-content', {
        body: { table, prompt: aiPrompt }
      });
      if (error) throw error;
      
      if (data) {
        // Map data directly into formData
        setFormData(prev => {
          const updated = { ...prev };
          Object.keys(data).forEach(key => {
            if (key === 'image_prompt') return; // Skip helper field
            
            if (key === 'extra_details' && data.extra_details) {
              updated.extra_details = {
                ...(updated.extra_details || {}),
                ...data.extra_details
              };
            } else {
              updated[key] = data[key];
            }
          });
          return updated;
        });
        showAlert('✨ AI Content and cover image generated successfully!', 'success');
      }
    } catch (err) {
      console.error('AI Generation failed:', err);
      showAlert(err.message || 'AI Generation failed', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const fields = useMemo(() => {
    switch (table) {
      case 'courses':
        return [
          { name: 'order_index', type: 'number', label: 'Order (1, 2, 3...)' },
          { name: 'category', type: 'text', label: 'Category' },
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'short_desc', type: 'textarea', label: 'Short Description' },
          { name: 'duration', type: 'text', label: 'Duration' },
          { name: 'price', type: 'text', label: 'Price' },
          { name: 'link', type: 'text', label: 'Link' },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'extra_details.details', type: 'string_array', label: 'Syllabus/Details (Comma separated)' },
          { name: 'extra_details.why_choose_this_course', type: 'textarea', label: 'Why Choose This Course?' },
          { name: 'extra_details.public_review', type: 'textarea', label: 'Student Review Text' },
          { name: 'extra_details.certification_available', type: 'boolean', label: 'Certification Available?' },
          { name: 'extra_details.certification_cost', type: 'text', label: 'Certification Cost' },
        ];
      case 'academics':
        return [
          { name: 'order_index', type: 'number', label: 'Order (1, 2, 3...)' },
          { name: 'title', type: 'text', label: 'Title', required: true },
          { name: 'description', type: 'textarea', label: 'Description' },
          { name: 'price', type: 'text', label: 'Price' },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'extra_details.details', type: 'string_array', label: 'Program Highlights (Comma separated)' },
          { name: 'extra_details.detailed_description', type: 'textarea', label: 'Detailed Description' },
          { name: 'extra_details.public_review', type: 'textarea', label: 'Student Review Text' },
          { name: 'extra_details.certification_available', type: 'boolean', label: 'Certification Available?' },
          { name: 'extra_details.certification_cost', type: 'text', label: 'Certification/Extra Cost' },
        ];
      case 'services':
        return [
          { name: 'order_index', type: 'number', label: 'Order (1, 2, 3...)' },
          { name: 'category', type: 'text', label: 'Category', required: true },
          { name: 'title', type: 'text', label: 'Title', required: true },
          { name: 'price', type: 'text', label: 'Price' },
          { name: 'link', type: 'text', label: 'Link' },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'description', type: 'textarea', label: 'Short Description' },
          { name: 'extra_details.details', type: 'string_array', label: 'Service Details (Comma separated)' },
          { name: 'extra_details.detailed_description', type: 'textarea', label: 'Detailed Description' },
          { name: 'extra_details.public_review', type: 'textarea', label: 'Client Review Text' },
          { name: 'extra_details.form_config', type: 'json', label: 'Custom Form & Workflow Config (JSON)' },
        ];
      case 'faculty':
        return [
          { name: 'order_index', type: 'number', label: 'Order (1, 2, 3...)' },
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'topic', type: 'text', label: 'Topic' },
          { name: 'stars', type: 'text', label: 'Stars' },
          { name: 'price', type: 'text', label: 'Price' },
          { name: 'link', type: 'text', label: 'Link' },
          { name: 'description', type: 'textarea', label: 'Description' },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'extra_details.education', type: 'string_array', label: 'Education (Comma separated)' },
          { name: 'extra_details.expertise', type: 'string_array', label: 'Expertise (Comma separated)' },
          { name: 'extra_details.research', type: 'string_array', label: 'Research Papers (Comma separated)' },
          { name: 'extra_details.books', type: 'string_array', label: 'Written Books (Comma separated)' },
          { name: 'extra_details.gamesPlayed', type: 'json', label: 'Games Played JSON Profile' }
        ];
      case 'notes':
        return [
          { name: 'order_index', type: 'number', label: 'Order (1, 2, 3...)' },
          { name: 'category', type: 'text', label: 'Category', required: true },
          { name: 'title', type: 'text', label: 'Title', required: true },
          { name: 'short_desc', type: 'textarea', label: 'Short Description' },
          { name: 'date', type: 'text', label: 'Date' },
          { name: 'link', type: 'text', label: 'Link' },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'extra_details.price', type: 'text', label: 'Price (e.g. ₹499 or FREE)', required: true },
          { name: 'extra_details.details', type: 'string_array', label: 'Note Highlights (Comma separated)' },
          { name: 'extra_details.detailed_description', type: 'textarea', label: 'Detailed Note Details' },
        ];
      case 'founders':
        return [
          { name: 'order_index', type: 'number', label: 'Order (1, 2, 3...)' },
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'role', type: 'text', label: 'Role', required: true },
          { name: 'bio', type: 'textarea', label: 'Bio', required: true },
          { name: 'extra_details.manifesto_id', type: 'text', label: 'Manifesto ID' },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'linkedin_url', type: 'text', label: 'LinkedIn URL' },
          { name: 'portfolio_url', type: 'text', label: 'Portfolio URL' },
          { name: 'extra_details.education', type: 'string_array', label: 'Education (Comma separated)' },
          { name: 'extra_details.expertise', type: 'string_array', label: 'Expertise (Comma separated)' },
          { name: 'extra_details.research', type: 'string_array', label: 'Research Papers (Comma separated)' },
          { name: 'extra_details.books', type: 'string_array', label: 'Written Books (Comma separated)' },
          { name: 'extra_details.gamesPlayed', type: 'json', label: 'Games Played JSON Profile' }
        ];
      case 'users':
      case 'profiles':
      case 'profiles_edit':
        return [
          { name: 'username', type: 'text', label: 'Username', required: true },
          { name: 'full_name', type: 'text', label: 'Full Name' },
          { name: 'phone', type: 'text', label: 'Phone' },
          { name: 'avatar_url', type: 'text', label: 'Avatar URL' },
          { name: 'role', type: 'select', label: 'Role', options: ['admin', 'student', 'faculty'] },
          { name: 'extra_details.id_number', type: 'text', label: 'ID Card Number' },
          { name: 'extra_details.user_type', type: 'select', label: 'User Persona Track', options: [
            { value: '', label: 'None/Not Set' },
            { value: 'student', label: 'Student' },
            { value: 'professional', label: 'Working Professional' },
            { value: 'aspirant', label: 'Aspirant' }
          ]},
          { name: 'extra_details.user_subtype', type: 'select', label: 'User Persona Subtype', options: [
            { value: '', label: 'None/Not Set' },
            { value: 'school', label: 'School (Student)' },
            { value: 'college', label: 'College (Student)' },
            { value: 'competitive exam', label: 'Competitive Exam (Aspirant)' },
            { value: 'job interview', label: 'Job Interview (Aspirant)' },
            { value: 'other', label: 'Other/University' }
          ]},
          ...(formData.role === 'student' ? [
            { name: 'extra_details.academics.attendance', type: 'text', label: 'Attendance %' },
            { name: 'extra_details.academics.avgGrade', type: 'text', label: 'Avg Grade' },
            { name: 'extra_details.academics.tasks', type: 'academic_tasks', label: 'Academic Directives (Tasks)' },
          ] : [])
        ];
      case 'student_submissions':
        return [
          { name: 'title', type: 'text', label: 'Title', required: true },
          { name: 'submission_type', type: 'select', label: 'Type', options: ['project', 'research_paper'], required: true },
          { name: 'summary', type: 'textarea', label: 'Summary' },
          { name: 'content_url', type: 'text', label: 'Content/Project URL' },
          { name: 'is_pushed', type: 'boolean', label: 'Push to Live?' },
        ];
      case 'service_inquiries':
        return [
          { name: 'name', type: 'text', label: 'Client Name', required: true },
          { name: 'email', type: 'text', label: 'Email', required: true },
          { name: 'phone', type: 'text', label: 'Phone/Contact' },
          { name: 'location', type: 'text', label: 'Location' },
          { name: 'service_type', type: 'text', label: 'Service Type' },
          { name: 'tier', type: 'text', label: 'Tier' },
          { name: 'budget', type: 'text', label: 'Budget' },
          { name: 'timeline', type: 'text', label: 'Timeline' },
          { name: 'status', type: 'select', label: 'Status', options: ['enquiry', 'ordered', 'contacted', 'completed', 'rejected'] },
          { name: 'requirements', type: 'textarea', label: 'Requirements & Pricing' },
          { name: 'custom_responses', type: 'json', label: 'Dynamic Field Data (JSON)' },
        ];
      case 'updates':
        return [
          { name: 'title', type: 'text', label: 'Update Title', required: true },
          { name: 'slug', type: 'text', label: 'URL Slug', required: true },
          { name: 'type', type: 'select', label: 'Type', options: ['content', 'patch'], required: true },
          { name: 'category', type: 'select', label: 'Category', options: ['course', 'service', 'note', 'academic', 'system', 'feature'] },
          { name: 'date', type: 'text', label: 'Date (e.g., May 11, 2026)' },
          { name: 'excerpt', type: 'textarea', label: 'Short Summary' },
          { name: 'content', type: 'textarea', label: 'Full Documentation (Markdown)' },
        ];
      default:
        return [];
    }
  }, [table]);

  const setValue = (name, value) => {
    const setNestedValue = (obj, path, val) => {
      const keys = path.split('.');
      const nextObj = { ...obj };
      let current = nextObj;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = { ...(current[key] || {}) };
        current = current[key];
      }
      current[keys[keys.length - 1]] = val;
      return nextObj;
    };
    setFormData((prev) => setNestedValue(prev, name, value));
  };

  const getValue = (name) => {
    return name.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), formData);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Filter payload to ONLY include valid fields for this table
      const validKeys = fields.map(f => f.name.split('.')[0]);
      const uniqueKeys = [...new Set(validKeys)];

      const payload = {};
      uniqueKeys.forEach(key => {
        if (formData[key] !== undefined) {
          // FORCEFUL FIX: If we are updating an existing entry, ONLY send keys that were returned from the database
          if (initialData?.id && !(key in initialData)) {
            console.warn(`Skipping key "${key}" because it does not exist in the original database row.`);
            return;
          }

          payload[key] = formData[key];
        }
      });

      // 2. Remove metadata
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      const actualTable = (table === 'profiles_edit' || table === 'users') ? 'profiles' : table;

      // AUTO-GENERATE ID NUMBER FOR ALL ROLES
      if ((actualTable === 'profiles' || actualTable === 'faculty' || actualTable === 'founders') && !initialData?.id) {
        const { count, error: countErr } = await adminSupabase
          .from(actualTable)
          .select('*', { count: 'exact', head: true });

        if (!countErr) {
          const serial = String((count || 0) + 1).padStart(4, '0');
          const prefix = actualTable === 'founders' ? '70326-FND' : actualTable === 'faculty' ? '70326-FAC' : '70326';
          const idNumber = `${prefix}-${serial}`;
          payload.extra_details = {
            ...(payload.extra_details || {}),
            id_number: idNumber
          };
          // For founders, also set manifesto_id if it's missing to keep it in sync
          if (actualTable === 'founders' && !payload.extra_details.manifesto_id) {
            payload.extra_details.manifesto_id = idNumber;
          }
        }
      }

      // INJECT AUTHOR_ID FOR SUBMISSIONS
      if (actualTable === 'student_submissions' && !initialData?.id) {
        payload.author_id = adminId;
      }

      const { data, error } = initialData?.id
        ? await adminSupabase.from(actualTable).update(payload).eq('id', initialData.id).select()
        : await adminSupabase.from(actualTable).insert([payload]).select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Update failed. You might not have permission (RLS blocked), or the record was not found.');
      }

      showAlert(initialData?.id ? 'Updated successfully' : 'Created successfully', 'success');

      // AUTO-GENERATE UPDATE FOR NEW CONTENT
      if (!initialData?.id && ['courses', 'services', 'notes', 'academics'].includes(actualTable)) {
        try {
          const updateTitle = `New ${actualTable.slice(0, -1)}: ${payload.title || payload.name}`;
          const updateSlug = `${actualTable.slice(0, -1)}-${Date.now()}`;

          await adminSupabase.from('updates').insert([{
            title: updateTitle,
            slug: updateSlug,
            type: 'patch',
            category: actualTable.slice(0, -1),
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            excerpt: payload.short_desc || payload.description || `A new entry has been added to the ${actualTable} database.`,
            content: `## Institutional Update\n\nA new **${actualTable.slice(0, -1)}** has been deployed to the 5EVEN Institutional network.\n\n**Record Title:** ${payload.title || payload.name}\n**Deployment Date:** ${new Date().toISOString()}`
          }]);
        } catch (updateErr) {
          console.warn('Failed to auto-generate update bulletin. You might need to add the "category" column to the updates table:', updateErr);
        }
      }

      onSuccess();
    } catch (err) {
      console.error('Admin save error:', err);
      showAlert(err.message || 'Save failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 pb-4">
      {/* AI Generator Panel */}
      {['courses', 'academics', 'services', 'faculty', 'notes', 'founders', 'updates'].includes(table) && (
        <div className="p-6 rounded-[28px] border border-primary/20 bg-primary/5 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row gap-4 items-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex-1 space-y-1 w-full">
            <h4 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles size={16} className="animate-pulse" />
              Generate with AI
            </h4>
            <p className="text-[10px] text-muted-foreground font-medium">Describe what you want to create (e.g. "Advanced React course on Next.js 15, 6 weeks duration"). AI will generate title, description, cover image, and metadata.</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Describe the entry..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 md:w-64 px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none text-xs"
            />
            <button
              type="button"
              disabled={aiLoading}
              onClick={handleAIGenerate}
              className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-55 hover:shadow-lg transition-all"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {fields.map((field, fIdx) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: fIdx * 0.05 }}
            className={field.type === 'textarea' || field.type === 'json' ? 'md:col-span-2 space-y-2' : 'space-y-2'}
          >
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {field.label} {field.required ? '*' : ''}
              </label>
              {['text', 'textarea', 'string_array'].includes(field.type) && (
                <button
                  type="button"
                  disabled={aiFieldLoading[field.name]}
                  onClick={() => handleFieldAIGenerate(field.name, field.label, field.type)}
                  className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-foreground/90 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {aiFieldLoading[field.name] ? (
                    <>
                      <Loader2 size={10} className="animate-spin text-primary" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={10} className="text-primary animate-pulse" />
                      <span>AI Generate</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {field.type === 'text' && (field.name.includes('image') || field.name.includes('url')) ? (
              <AdminImageField
                label={field.label}
                value={getValue(field.name)}
                onChange={(val) => setValue(field.name, val)}
                adminId={adminId}
              />
            ) : field.type === 'textarea' ? (
              <RichWordEditor
                value={getValue(field.name) || ''}
                onChange={(val) => setValue(field.name, val)}
                placeholder={field.label}
              />
            ) : field.type === 'string_array' ? (
              <textarea
                value={Array.isArray(getValue(field.name)) ? getValue(field.name).join(', ') : (getValue(field.name) || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  setValue(field.name, val ? val.split(',').map(s => s.trim()).filter(Boolean) : []);
                }}
                className="w-full min-h-[80px] max-h-64 px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none overflow-y-auto custom-scrollbar resize-y"
                placeholder="Item 1, Item 2..."
                data-lenis-prevent="true"
              />
            ) : field.type === 'select' ? (
              <GlassSelect
                value={getValue(field.name) || (field.options?.[0]?.value || field.options?.[0])}
                onChange={(val) => setValue(field.name, val)}
                options={field.options}
                className="w-full"
              />
            ) : field.type === 'boolean' ? (
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={!!getValue(field.name)}
                  onChange={(e) => setValue(field.name, e.target.checked)}
                  className="w-6 h-6 rounded-md border-border bg-background focus:ring-primary accent-primary"
                />
                <span className="text-xs font-bold uppercase tracking-widest text-foreground">Yes</span>
              </div>
            ) : field.type === 'json' && field.name === 'extra_details.form_config' ? (
              <div key={field.name} className="md:col-span-2">
                <ServiceWorkflowEditor
                  value={getValue(field.name)}
                  onChange={(val) => setValue(field.name, val)}
                />
              </div>
            ) : field.type === 'academic_tasks' ? (
              <StudentAcademicEditor
                value={getValue(field.name)}
                onChange={(val) => setValue(field.name, val)}
              />
            ) : field.type === 'json' ? (
              <JSONFieldEditor
                label={field.label}
                value={getValue(field.name)}
                onChange={(val) => setValue(field.name, val)}
              />
            ) : (
              <input
                type={field.type}
                value={getValue(field.name) || ''}
                onChange={(e) => setValue(field.name, e.target.value)}
                required={field.required}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-3 flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-5 py-3 rounded-xl border border-border font-black uppercase tracking-widest text-xs">
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="save-button w-full md:w-auto text-[11px]"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        </button>
      </div>
      <CustomPromptModal
        isOpen={promptState.isOpen}
        title={promptState.title}
        message={promptState.message}
        placeholder={promptState.placeholder}
        value={promptState.value}
        onChange={(val) => setPromptState(prev => ({ ...prev, value: val }))}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </form>
  );
};

export default SevenMod;
