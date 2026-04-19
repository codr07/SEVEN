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
} from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const adminSupabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storageKey: 'seven-admin-auth-v3',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
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
  const [adminUser, setAdminUser] = useState(null);
  const [adminRole, setAdminRole] = useState('guest');
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tableData, setTableData] = useState([]);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

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

    adminSupabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const user = session?.user ?? null;
      setAdminUser(user);
      await loadAdminRole(user?.id);
      if (mounted) setAuthLoading(false);
    });

    const { data: { subscription } } = adminSupabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const user = session?.user ?? null;
      setAdminUser(user);
      await loadAdminRole(user?.id);
      if (mounted) setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleAdminLogin = async (email, password) => {
    const { error } = await adminSupabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleLogout = async () => {
    const { error } = await adminSupabase.auth.signOut({ scope: 'local' });
    if (error) {
      alert(error.message || 'Failed to sign out. Please try again.');
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
    const countTargets = [...CONTENT_TABLES.map((t) => t.id), 'profiles', 'student_submissions'];

    try {
      const results = await Promise.all(
        countTargets.map(async (tableName) => {
          const { count } = await adminSupabase.from(tableName).select('*', { count: 'exact', head: true });
          return { tableName, count: count || 0 };
        })
      );
      setStats(results);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
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
    if (!window.confirm('Delete this item?')) return;

    const { error } = await adminSupabase.from(tableName).delete().eq('id', id);
    if (error) {
      alert(error.message);
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
  };

  const updateUserRole = async (id, nextRole) => {
    const { error } = await adminSupabase
      .from('profiles')
      .update({ role: nextRole, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      alert(error.message);
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
      alert(error.message);
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
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border p-4 md:p-6 bg-card md:h-full overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div>
            <p className="font-black text-lg">5EVEN Admin</p>
            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Control Center</p>
          </div>
        </div>

        <nav className="space-y-2">
          {ADMIN_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'hover:bg-background text-muted-foreground'
                }`}
              >
                <Icon size={16} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-destructive/40 text-destructive font-black uppercase tracking-widest text-xs"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-animate-gradient">{activeTableTitle}</h1>
            <p className="text-muted-foreground">Manage all data, users, and publishing workflow.</p>
          </div>

          {CONTENT_TABLES.some((t) => t.id === activeTab) && (
            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-6 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              <Plus size={18} /> Add New Entry
            </button>
          )}
        </header>

        {activeTab === 'dashboard' && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((item) => (
              <div key={item.tableName} className="p-5 rounded-2xl border border-border bg-card">
                <p className="text-xs uppercase tracking-widest font-black text-muted-foreground">{item.tableName}</p>
                <p className="text-3xl font-black mt-1">{item.count}</p>
              </div>
            ))}
          </motion.section>
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tableData.map((item) => (
                  <article key={item.id} className="p-5 rounded-2xl border border-border bg-card space-y-4">
                    <div>
                      <p className="font-black text-lg line-clamp-1">{item.name || item.title || item.role || 'Untitled'}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                        {item.short_desc || item.description || item.bio || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => removeItem(activeTab, item.id)}
                        className="px-4 py-2 rounded-xl border border-destructive/40 text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
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
                        onClick={() => togglePush(item)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                          item.is_pushed ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-green-500/10 text-green-600 dark:text-green-400'
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

      {isModalOpen && CONTENT_TABLES.some((t) => t.id === activeTab) && (
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
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <AdminForm
                table={activeTab}
                initialData={editingItem}
                onCancel={() => setIsModalOpen(false)}
                onSuccess={() => {
                  setIsModalOpen(false);
                  fetchTable(activeTab);
                  fetchStats();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const JSONFieldEditor = ({ value, onChange, label }) => {
  const [pairs, setPairs] = useState(() => {
    if (!value || typeof value !== 'object') return [{ key: '', value: '' }];
    return Object.entries(value).map(([k, v]) => ({ key: k, value: String(v) }));
  });

  const updatePairs = (newPairs) => {
    setPairs(newPairs);
    const obj = {};
    newPairs.forEach((p) => {
      if (p.key.trim()) obj[p.key.trim()] = p.value;
    });
    onChange(obj);
  };

  const addPair = () => updatePairs([...pairs, { key: '', value: '' }]);
  const removePair = (idx) => {
    const next = pairs.filter((_, i) => i !== idx);
    updatePairs(next.length ? next : [{ key: '', value: '' }]);
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
      <div className="flex items-center justify-between mb-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
        <button type="button" onClick={addPair} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80">
          <Plus size={12} /> Add Detail
        </button>
      </div>
      <div className="space-y-2">
        {pairs.map((pair, idx) => (
          <div key={idx} className="flex gap-2 group animate-in slide-in-from-left-2 duration-300">
            <input
              placeholder="Label"
              value={pair.key}
              onChange={(e) => {
                const next = [...pairs];
                next[idx].key = e.target.value;
                updatePairs(next);
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-xs font-bold"
            />
            <input
              placeholder="Value"
              value={pair.value}
              onChange={(e) => {
                const next = [...pairs];
                next[idx].value = e.target.value;
                updatePairs(next);
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-xs"
            />
            <button type="button" onClick={() => removePair(idx)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminImageField = ({ value, onChange, label }) => {
  const [uploading, setUploading] = useState(false);

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`;
      const filePath = `admin/${fileName}`;

      const { error: uploadError } = await adminSupabase.storage
        .from('content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = adminSupabase.storage
        .from('content')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
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
    className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
      type === 'success'
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
    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
      pushed
        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
        : status === 'unpushed'
          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    }`}
  >
    {pushed ? 'Pushed' : status === 'unpushed' ? 'Unpushed' : 'On Hold'}
  </span>
);

const AdminForm = ({ table, initialData, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {});
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
          { name: 'details', type: 'json', label: 'Details JSON' },
          { name: 'extra_details', type: 'json', label: 'Extra Details JSON' },
        ];
      case 'academics':
        return [
          { name: 'title', type: 'text', label: 'Title', required: true },
          { name: 'description', type: 'textarea', label: 'Description' },
        ];
      case 'services':
        return [
          { name: 'category', type: 'text', label: 'Category', required: true },
          { name: 'title', type: 'text', label: 'Title', required: true },
          { name: 'price', type: 'text', label: 'Price' },
          { name: 'link', type: 'text', label: 'Link' },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'description', type: 'json', label: 'Description JSON' },
          { name: 'extra_details', type: 'json', label: 'Extra Details JSON' },
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
          { name: 'extra_details', type: 'json', label: 'Extra Details JSON' },
        ];
      case 'notes':
        return [
          { name: 'category', type: 'text', label: 'Category', required: true },
          { name: 'title', type: 'text', label: 'Title', required: true },
          { name: 'short_desc', type: 'textarea', label: 'Short Description' },
          { name: 'date', type: 'text', label: 'Date' },
          { name: 'link', type: 'text', label: 'Link' },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'extra_details', type: 'json', label: 'Extra Details JSON' },
        ];
      case 'founders':
        return [
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'role', type: 'text', label: 'Role', required: true },
          { name: 'bio', type: 'textarea', label: 'Bio', required: true },
          { name: 'cover_image', type: 'text', label: 'Cover Image URL' },
          { name: 'linkedin_url', type: 'text', label: 'LinkedIn URL' },
          { name: 'portfolio_url', type: 'text', label: 'Portfolio URL' },
          { name: 'extra_details', type: 'json', label: 'Extra Details JSON' },
        ];
      default:
        return [];
    }
  }, [table]);

  const setValue = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setJson = (name, value) => {
    if (!value.trim()) {
      setValue(name, null);
      return;
    }

    try {
      setValue(name, JSON.parse(value));
    } catch {
      // Keep current value until valid JSON is provided.
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      if (initialData?.id) {
        const { error } = await adminSupabase.from(table).update(payload).eq('id', initialData.id);
        if (error) throw error;
      } else {
        const { error } = await adminSupabase.from(table).insert([payload]);
        if (error) throw error;
      }

      onSuccess();
    } catch (err) {
      alert(err.message || 'Save failed');
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
                value={formData[field.name]}
                onChange={(val) => setValue(field.name, val)}
              />
            ) : field.type === 'textarea' ? (
              <textarea
                value={formData[field.name] || ''}
                onChange={(e) => setValue(field.name, e.target.value)}
                required={field.required}
                className="w-full min-h-[120px] px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
              />
            ) : field.type === 'json' ? (
              <JSONFieldEditor
                label={field.label}
                value={formData[field.name]}
                onChange={(val) => setValue(field.name, val)}
              />
            ) : (
              <input
                type={field.type}
                value={formData[field.name] || ''}
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
          className="px-5 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center gap-2"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
        </button>
      </div>
    </form>
  );
};

export default SevenMod;
