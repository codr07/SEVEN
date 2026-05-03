import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
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
  Rocket
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
];

const ALL_TABLES = [
  ...CONTENT_TABLES,
  { id: 'profiles', name: 'Users' },
  { id: 'student_submissions', name: 'Submissions' }
];

const ADMIN_TABS = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  ...CONTENT_TABLES.map((t) => ({ id: t.id, name: t.name, icon: Package })),
  { id: 'users', name: 'Users & Roles', icon: Users },
  { id: 'student_submissions', name: 'Student Submissions', icon: Upload },
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
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [graphTimeframes, setGraphTimeframes] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const fetchRowsWithCreatedAtFallback = async (tableName, selectClause = '*') => {
    const orderedQuery = adminSupabase.from(tableName).select(selectClause).order('created_at', { ascending: false });
    const orderedResult = await orderedQuery;

    if (!orderedResult.error) {
      return orderedResult;
    }

    const fallbackResult = await adminSupabase.from(tableName).select(selectClause);
    if (fallbackResult.error) {
      return fallbackResult;
    }

    const sorted = [...(fallbackResult.data || [])].sort((a, b) => {
      const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    return { data: sorted, error: null };
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
    const { error } = await adminSupabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
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

    fetchTable(activeTab);
  }, [activeTab, adminUser, adminRole]);

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
        'id, username, full_name, phone, avatar_url, role, created_at'
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
                      <Legend verticalAlign="bottom" height={36}/>
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
                              onClick={() => setGraphTimeframes(prev => ({...prev, [stat.tableName]: tf}))}
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
                        <p className="font-bold">{item.full_name || item.username || item.id}</p>
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
                      <select
                        value={item.role || 'student'}
                        onChange={(e) => updateUserRole(item.id, e.target.value)}
                        className="px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold"
                      >
                        <option value="student">student</option>
                        <option value="admin">admin</option>
                      </select>
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
                      <div>
                        <p className="font-black text-lg">{item.title}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
                          {item.submission_type} • by {item.author_profile?.full_name || item.author_profile?.username || item.author_id}
                        </p>
                      </div>
                      <StatusBadge pushed={item.is_pushed} status={item.moderation_status} />
                    </div>

                    <p className="text-sm text-muted-foreground">{item.summary}</p>

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
      </main>

      {isModalOpen && (CONTENT_TABLES.some((t) => t.id === activeTab) || activeTab === 'users' || activeTab === 'student_submissions') && (
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
  <div
    className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${type === 'success'
      ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
      : 'border-destructive/30 bg-destructive/10 text-destructive'
      }`}
  >
    {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
    {children}
  </div>
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

  const fields = useMemo(() => {
    switch (table) {
      case 'courses':
        return [
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
          { name: 'category', type: 'text', label: 'Category', required: true },
          { name: 'title', type: 'text', label: 'Title', required: true },
          { name: 'price', type: 'text', label: 'Price' },
          { name: 'link', type: 'text', label: 'Link' },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'description', type: 'textarea', label: 'Short Description' },
          { name: 'extra_details.details', type: 'string_array', label: 'Service Details (Comma separated)' },
          { name: 'extra_details.detailed_description', type: 'textarea', label: 'Detailed Description' },
          { name: 'extra_details.public_review', type: 'textarea', label: 'Client Review Text' },
        ];
      case 'faculty':
        return [
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
          { name: 'category', type: 'text', label: 'Category', required: true },
          { name: 'title', type: 'text', label: 'Title', required: true },
          { name: 'short_desc', type: 'textarea', label: 'Short Description' },
          { name: 'date', type: 'text', label: 'Date' },
          { name: 'link', type: 'text', label: 'Link' },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'extra_details.details', type: 'string_array', label: 'Note Highlights (Comma separated)' },
          { name: 'extra_details.detailed_description', type: 'textarea', label: 'Detailed Note Details' },
        ];
      case 'founders':
        return [
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'role', type: 'text', label: 'Role', required: true },
          { name: 'bio', type: 'textarea', label: 'Bio', required: true },
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
          { name: 'role', type: 'text', label: 'Role (admin/student)' },
        ];
      case 'student_submissions':
        return [
          { name: 'title', type: 'text', label: 'Title', required: true },
          { name: 'submission_type', type: 'text', label: 'Type', required: true },
          { name: 'summary', type: 'textarea', label: 'Summary' },
          { name: 'content_url', type: 'text', label: 'Content/Project URL' },
          { name: 'is_pushed', type: 'boolean', label: 'Push to Live?' },
        ];
      default:
        return [];
    }
  }, [table]);

  const setValue = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getValue = (name) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      return formData[parent] ? formData[parent][child] : undefined;
    }
    return formData[name];
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
          // FORCEFUL FIX 2: Explicitly strip extra_details for academics because the DB column doesn't exist yet, which breaks Inserts
          if (table === 'academics' && key === 'extra_details') {
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
      
      const { data, error } = initialData?.id 
        ? await adminSupabase.from(actualTable).update(payload).eq('id', initialData.id).select()
        : await adminSupabase.from(actualTable).insert([payload]).select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Update failed. You might not have permission (RLS blocked), or the record was not found.');
      }
      
      showAlert(initialData?.id ? 'Updated successfully' : 'Created successfully', 'success');

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {fields.map((field, fIdx) => (
          <motion.div
            key={field.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: fIdx * 0.05 }}
            className={field.type === 'textarea' || field.type === 'json' ? 'md:col-span-2 space-y-2' : 'space-y-2'}
          >
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {field.label} {field.required ? '*' : ''}
            </label>

            {field.type === 'text' && (field.name.includes('image') || field.name.includes('url')) ? (
              <AdminImageField
                label={field.label}
                value={getValue(field.name)}
                onChange={(val) => setValue(field.name, val)}
                adminId={adminId}
              />
            ) : field.type === 'textarea' ? (
              <textarea
                value={getValue(field.name) || ''}
                onChange={(e) => setValue(field.name, e.target.value)}
                required={field.required}
                className="w-full min-h-[120px] max-h-64 px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none overflow-y-auto custom-scrollbar resize-y"
                data-lenis-prevent="true"
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
          <span>{initialData ? 'Save Changes' : 'Create Entry'}</span>
        </button>
      </div>
    </form>
  );
};

export default SevenMod;
