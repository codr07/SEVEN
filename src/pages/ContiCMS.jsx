import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useAlert } from '../context/AlertContext';
import { Loader2, Plus, Trash2, Save, X, Edit2, Play, FileText, Settings, LogOut, LayoutDashboard, FolderOpen, Menu, User, BookOpen, UploadCloud, RefreshCw } from 'lucide-react';
import GlassSelect from '../components/GlassSelect';
import logoMain from '../assets/seven.svg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Independent admin client similar to SevenMod
const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'seven-admin-auth-v3',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: (name, acquireTimeout, fn) => fn(),
  },
});

const INITIAL_FORM = {
  product_id: '',
  product_type: 'course',
  title: '',
  description: '',
  video_url: '',
  subtitle_url: '',
  pdf_url: '',
  order_index: 0
};

// UI Components for Login
const Field = ({ label, children, required }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
      {label} {required && <span className="text-primary">*</span>}
    </label>
    {children}
  </div>
);

const MessageBox = ({ type, children }) => (
  <div className={`p-4 rounded-xl text-sm font-medium border ${
    type === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
    type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
    'bg-primary/10 text-primary border-primary/20'
  }`}>
    {children}
  </div>
);

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative z-10">
      <div className="w-full max-w-md p-8 rounded-3xl border border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary mx-auto mb-4 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]">
            <Settings size={28} />
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-animate-gradient">Conti CMS</h1>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">Content Administration</p>
        </div>

        <form onSubmit={submit} className="space-y-5 relative z-10">
          <Field label="Admin Email" required>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 outline-none transition-all text-white font-medium"
            />
          </Field>
          <Field label="Password" required>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 outline-none transition-all text-white font-medium"
            />
          </Field>

          {error ? <MessageBox type="error">{error}</MessageBox> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ContiCMS = () => {
  const { showAlert, showConfirm } = useAlert();
  
  const [adminUser, setAdminUser] = useState(null);
  const [adminRole, setAdminRole] = useState('guest');
  const [authLoading, setAuthLoading] = useState(true);

  const [contents, setContents] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableNotes, setAvailableNotes] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);
  
  // State for multiple sections
  const [sections, setSections] = useState([{ title: '', description: '', video_url: '', pdf_url: '', subtitle_url: '' }]);
  const [examUrl, setExamUrl] = useState('');
  
  // File objects for uploads
  const [videoFile, setVideoFile] = useState(null);
  const [subtitleFile, setSubtitleFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(true);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = async (email, password) => {
    const { data, error: authError } = await adminSupabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;

    const { data: profileData, error: profileError } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !['admin', 'visionary', 'founder'].includes(profileData?.role)) {
      await adminSupabase.auth.signOut();
      throw new Error('Unauthorized access. Admin privileges required.');
    }
  };

  const handleLogout = async () => {
    await adminSupabase.auth.signOut();
  };

  const isAdmin = ['admin', 'visionary', 'founder'].includes(adminRole);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contentsRes, coursesRes, notesRes] = await Promise.all([
        adminSupabase.from('product_content').select('*').order('product_type', { ascending: true }).order('product_id', { ascending: true }).order('order_index', { ascending: true }),
        adminSupabase.from('courses').select('id, name').order('name'),
        adminSupabase.from('notes').select('id, title').order('title')
      ]);

      if (contentsRes.error) throw contentsRes.error;
      if (coursesRes.error) throw coursesRes.error;
      if (notesRes.error) throw notesRes.error;

      setContents(contentsRes.data || []);
      setAvailableCourses(coursesRes.data || []);
      setAvailableNotes(notesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      showAlert('Failed to load data from database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAdmin, authLoading]);

  const uploadFile = async (file, path) => {
    const { error } = await adminSupabase.storage
      .from('product_assets')
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    
    const { data } = adminSupabase.storage
      .from('product_assets')
      .getPublicUrl(path);
      
    return data.publicUrl;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!formData.product_id) {
      showAlert('Please select a valid product.', 'error');
      return;
    }

    setIsBusy(true);
    let updatedData = { ...formData };

    try {
      if (editId || formData.product_type === 'note') {
        // Handle file uploads for single item
        if (videoFile) {
          const ext = videoFile.name.split('.').pop();
          const path = `${formData.product_type}/${formData.product_id}/video_${Date.now()}.${ext}`;
          updatedData.video_url = await uploadFile(videoFile, path);
        }
        
        if (subtitleFile) {
          const ext = subtitleFile.name.split('.').pop();
          const path = `${formData.product_type}/${formData.product_id}/subtitle_${Date.now()}.${ext}`;
          updatedData.subtitle_url = await uploadFile(subtitleFile, path);
        }

        if (pdfFile) {
          const ext = pdfFile.name.split('.').pop();
          const path = `${formData.product_type}/${formData.product_id}/note_${Date.now()}.${ext}`;
          updatedData.pdf_url = await uploadFile(pdfFile, path);
        }

        if (formData.product_type === 'note') {
          updatedData.title = 'Complete Study Notes';
          updatedData.order_index = 0;
          updatedData.description = 'Comprehensive reference notes document.';
        }

        if (editId) {
          const { error } = await adminSupabase
            .from('product_content')
            .update(updatedData)
            .eq('id', editId);
          if (error) throw error;
          showAlert('Content updated successfully.', 'success');
        } else {
          const { error } = await adminSupabase
            .from('product_content')
            .insert([updatedData]);
          if (error) throw error;
          showAlert('Content created successfully.', 'success');
        }
      } else {
        // Course multiple sections insertion logic
        const sectionsToInsert = [];
        
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          if (!sec.title.trim()) {
            throw new Error(`Section ${i + 1} must have a title.`);
          }
          
          sectionsToInsert.push({
            product_id: formData.product_id,
            product_type: 'course',
            title: sec.title,
            description: sec.description || '',
            video_url: sec.video_url || '',
            subtitle_url: sec.subtitle_url || '',
            pdf_url: sec.pdf_url || '',
            order_index: i
          });
        }

        // Always append the exam section as the default section at the end
        const examSection = {
          product_id: formData.product_id,
          product_type: 'course',
          title: "Final Certification Exam",
          description: "Please complete this official examination to demonstrate your core subject mastery and claim your verified certificate.",
          video_url: examUrl || 'https://forms.google.com', // Stored as video_url for the exam link
          subtitle_url: '',
          pdf_url: '',
          order_index: sectionsToInsert.length
        };

        sectionsToInsert.push(examSection);

        const { error } = await adminSupabase
          .from('product_content')
          .insert(sectionsToInsert);

        if (error) throw error;
        showAlert('Multiple Course Sections with Exam successfully created.', 'success');
      }
      
      setShowModal(false);
      fetchData();
    } catch (err) {
      showAlert(err.message || 'Failed to save content.', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = (id) => {
    showConfirm('Are you sure you want to delete this content module?', async () => {
      try {
        const { error } = await adminSupabase.from('product_content').delete().eq('id', id);
        if (error) throw error;
        showAlert('Content deleted.', 'success');
        fetchData();
      } catch (err) {
        showAlert(err.message || 'Failed to delete.', 'error');
      }
    });
  };

  const openEdit = (item) => {
    setFormData({
      product_id: item.product_id,
      product_type: item.product_type,
      title: item.title,
      description: item.description || '',
      video_url: item.video_url || '',
      subtitle_url: item.subtitle_url || '',
      pdf_url: item.pdf_url || '',
      order_index: item.order_index || 0
    });
    setVideoFile(null);
    setSubtitleFile(null);
    setPdfFile(null);
    setEditId(item.id);
    setSections([{ title: '', description: '', video_url: '', pdf_url: '', subtitle_url: '' }]);
    setExamUrl('');
    setShowModal(true);
  };

  const openCreate = (defaultType = 'course') => {
    setFormData({ ...INITIAL_FORM, product_type: defaultType });
    setVideoFile(null);
    setSubtitleFile(null);
    setPdfFile(null);
    setEditId(null);
    setSections([{ title: '', description: '', video_url: '', pdf_url: '', subtitle_url: '' }]);
    setExamUrl('');
    setShowModal(true);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!adminUser || !isAdmin) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const courseContents = contents.filter(c => c.product_type === 'course');
  const noteContents = contents.filter(c => c.product_type === 'note');

  const TABS = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', name: 'Courses Content', icon: Play },
    { id: 'notes', name: 'Notes Content', icon: BookOpen }
  ];

  // Map database entries to dropdown options
  const productOptions = formData.product_type === 'course' 
    ? availableCourses.map(c => ({ value: c.name, label: c.name })) // We match by name for courses
    : availableNotes.map(n => ({ value: n.title, label: n.title })); // We match by title for notes

  const renderContentTable = (data, type) => (
    <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-xl font-black capitalize">{type} Modules</h2>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">
            {data.length} Total Entries
          </p>
        </div>
        <button
          onClick={() => openCreate(type)}
          className="px-6 py-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/20"
        >
          <Plus size={14} /> Add {type} Content
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold">No {type} content found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Target</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Section & Order</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assets</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-sm text-white/90">{item.product_id}</td>
                  <td className="p-4">
                    <div className="font-bold text-sm">{item.title}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Order: {item.order_index}</div>
                  </td>
                  <td className="p-4 flex gap-2">
                    {item.video_url && <span className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-lg shadow-inner" title="Video"><Play size={14} /></span>}
                    {item.pdf_url && <span className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg shadow-inner" title="Notes PDF"><FileText size={14} /></span>}
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEdit(item)} className="w-8 h-8 inline-flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors mr-2">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 inline-flex items-center justify-center bg-destructive/10 hover:bg-destructive rounded-lg text-destructive hover:text-white transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-3">
            <Settings className="text-primary" size={20} />
            <span className="font-black italic tracking-tighter">CONTI CMS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/5 rounded-xl">
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || !isMobile) && (
          <motion.div
            initial={isMobile ? { x: -300 } : false}
            animate={{ x: 0 }}
            exit={isMobile ? { x: -300 } : undefined}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`
              fixed md:static inset-y-0 left-0 z-50 bg-black/60 backdrop-blur-3xl border-r border-white/5 flex flex-col md:transition-all md:duration-300
              ${isMobile ? 'shadow-2xl w-72' : (isCollapsed ? 'w-20' : 'w-72')}
            `}
          >
            {/* Logo */}
            <div className={`h-24 flex items-center border-b border-white/5 ${isCollapsed && !isMobile ? 'justify-center px-0' : 'px-8 gap-4'}`}>
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] shrink-0 overflow-hidden">
                <img src={logoMain} alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              {(!isCollapsed || isMobile) && (
                <div>
                  <h1 className="font-black italic tracking-tighter text-xl">CONTI CMS</h1>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Content System</p>
                </div>
              )}
              {isMobile && (
                <button onClick={() => setIsSidebarOpen(false)} className="ml-auto p-2 bg-white/5 rounded-lg text-muted-foreground">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* User Details */}
            {(!isCollapsed || isMobile) && (
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                    <User size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate text-white">{adminUser?.email}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">{adminRole}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar py-6 space-y-2 ${isCollapsed && !isMobile ? 'px-2' : 'px-4'}`}>
              {(!isCollapsed || isMobile) && (
                <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Management</p>
              )}
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center transition-all duration-300 font-bold text-sm rounded-2xl
                      ${isCollapsed && !isMobile ? 'justify-center p-3 gap-0' : 'px-5 py-4 gap-3'}
                      ${isActive 
                        ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]' 
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'}
                    `}
                    title={tab.name}
                  >
                    <Icon size={18} className={isActive ? 'text-primary shrink-0' : 'opacity-70 shrink-0'} />
                    {(!isCollapsed || isMobile) && <span>{tab.name}</span>}
                  </button>
                );
              })}
            </div>

            {/* Logout */}
            <div className={`border-t border-white/5 bg-black/20 ${isCollapsed && !isMobile ? 'p-3' : 'p-6'}`}>
              <button
                onClick={handleLogout}
                className={`flex items-center justify-center bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all font-black uppercase tracking-widest text-xs rounded-2xl ${
                  isCollapsed && !isMobile ? 'w-10 h-10 p-0 border-none' : 'w-full gap-3 px-5 py-4'
                }`}
                title="Logout"
              >
                <LogOut size={16} />
                {(!isCollapsed || isMobile) && <span>Logout</span>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden ${isMobile ? 'pt-16' : ''}`}>
        
        {/* Top Header */}
        <header className="h-24 px-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl shrink-0">
          <div>
            <h2 className="text-2xl font-black">{TABS.find(t => t.id === activeTab)?.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
              Conti System Admin Interface
            </p>
          </div>
          <button onClick={() => fetchData()} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10" title="Refresh Data">
            <RefreshCw size={18} className="opacity-70" />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  {/* Dashboard Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-primary/20 to-black border border-primary/20 rounded-3xl p-8 relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all"></div>
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary mb-6 border border-primary/30">
                        <Play size={24} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Course Sections</p>
                      <h3 className="text-5xl font-black text-white mt-2">{courseContents.length}</h3>
                    </div>
                    
                    <div className="bg-gradient-to-br from-secondary/20 to-black border border-secondary/20 rounded-3xl p-8 relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-32 h-32 bg-secondary/20 rounded-full blur-3xl group-hover:bg-secondary/30 transition-all"></div>
                      <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary mb-6 border border-secondary/30">
                        <BookOpen size={24} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Note Sections</p>
                      <h3 className="text-5xl font-black text-white mt-2">{noteContents.length}</h3>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'courses' && renderContentTable(courseContents, 'course')}
              {activeTab === 'notes' && renderContentTable(noteContents, 'note')}

            </motion.div>
          </AnimatePresence>

        </main>
      </div>

      {/* Modal / Form Overlay */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center p-4 py-12"
            data-lenis-prevent="true"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative my-auto overflow-hidden"
            >
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl shrink-0 z-20">
                <h2 className="text-2xl font-black uppercase tracking-tighter">
                  {editId ? 'Edit Section' : `New ${formData.product_type === 'course' ? 'Course Curriculum' : 'Note Section'}`}
                </h2>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div className="p-6 md:p-8 space-y-6 relative z-10">
                  
                  <Field label="Target Product (Matches Database Exactly)" required>
                    {productOptions.length === 0 ? (
                      <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm font-bold">
                        No {formData.product_type}s found in the database. Please create one first.
                      </div>
                    ) : (
                      <GlassSelect
                        value={formData.product_id}
                        onChange={(val) => setFormData({...formData, product_id: val})}
                        options={productOptions}
                        placeholder="Select a Database Product..."
                      />
                    )}
                  </Field>

                  {(!editId && formData.product_type === 'course') ? (
                    <div className="space-y-6">
                      {/* Exam Link Input */}
                      <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-3">Certification Settings</h3>
                        <Field label="Verified Exam Link (e.g. Google Forms / Quiz URL)">
                          <input
                            type="url"
                            value={examUrl}
                            onChange={(e) => setExamUrl(e.target.value)}
                            placeholder="https://forms.gle/your-exam-link"
                            className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 outline-none transition-all text-white font-medium"
                          />
                        </Field>
                      </div>

                      <div className="border-t border-white/10 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white">Course Sections / Modules</h3>
                          <button
                            type="button"
                            onClick={() => setSections([...sections, { title: '', description: '', video_url: '', pdf_url: '', subtitle_url: '' }])}
                            className="px-4 py-2 rounded-xl bg-primary/20 hover:bg-primary text-primary hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
                          >
                            <Plus size={14} /> Add Section Slot
                          </button>
                        </div>

                        <div className="space-y-6">
                          {sections.map((sec, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative space-y-4">
                              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="text-xs font-black uppercase tracking-widest text-primary">Section #{idx + 1}</span>
                                {sections.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setSections(sections.filter((_, i) => i !== idx))}
                                    className="text-destructive hover:text-white bg-destructive/10 hover:bg-destructive p-2 rounded-lg transition-all"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}                              </div>

                              <Field label="Section Title" required>
                                <input
                                  type="text"
                                  required
                                  value={sec.title}
                                  onChange={(e) => {
                                    const newSecs = [...sections];
                                    newSecs[idx].title = e.target.value;
                                    setSections(newSecs);
                                  }}
                                  placeholder="e.g. 1. Introduction to Web Development"
                                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-primary outline-none transition-all text-white text-sm font-medium"
                                />
                              </Field>

                              <Field label="Section Description">
                                <textarea
                                  value={sec.description}
                                  onChange={(e) => {
                                    const newSecs = [...sections];
                                    newSecs[idx].description = e.target.value;
                                    setSections(newSecs);
                                  }}
                                  placeholder="A brief overview of what students will learn in this section..."
                                  className="w-full h-20 px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-primary outline-none resize-none transition-all text-white text-sm font-medium"
                                />
                              </Field>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Video URL (Optional)">
                                  <input
                                    type="url"
                                    value={sec.video_url}
                                    onChange={(e) => {
                                      const newSecs = [...sections];
                                      newSecs[idx].video_url = e.target.value;
                                      setSections(newSecs);
                                    }}
                                    placeholder="https://example.com/video.mp4"
                                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-primary outline-none transition-all text-white text-sm font-medium"
                                  />
                                </Field>

                                <Field label="Notes PDF URL (Optional)">
                                  <input
                                    type="url"
                                    value={sec.pdf_url}
                                    onChange={(e) => {
                                      const newSecs = [...sections];
                                      newSecs[idx].pdf_url = e.target.value;
                                      setSections(newSecs);
                                    }}
                                    placeholder="https://example.com/notes.pdf"
                                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-primary outline-none transition-all text-white text-sm font-medium"
                                  />
                                </Field>

                                <Field label="Subtitle VTT URL (Optional)" className="col-span-1 md:col-span-2">
                                  <input
                                    type="url"
                                    value={sec.subtitle_url}
                                    onChange={(e) => {
                                      const newSecs = [...sections];
                                      newSecs[idx].subtitle_url = e.target.value;
                                      setSections(newSecs);
                                    }}
                                    placeholder="https://example.com/subtitles.vtt"
                                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-primary outline-none transition-all text-white text-sm font-medium"
                                  />
                                </Field>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {formData.product_type === 'course' && (
                        <>
                          <div className="grid grid-cols-1 gap-6">
                            <Field label="Section Order (Sorting)" required>
                              <input
                                type="number"
                                value={formData.order_index}
                                onChange={(e) => setFormData({...formData, order_index: parseInt(e.target.value) || 0})}
                                className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 outline-none transition-all text-white font-medium"
                              />
                            </Field>
                          </div>

                          <Field label="Section Heading" required>
                            <input
                              type="text"
                              required
                              value={formData.title}
                              onChange={(e) => setFormData({...formData, title: e.target.value})}
                              placeholder="e.g. Chapter 1: The Beginning"
                              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 outline-none transition-all text-white font-medium"
                            />
                          </Field>

                          <Field label="Section Description">
                            <textarea
                              value={formData.description}
                              onChange={(e) => setFormData({...formData, description: e.target.value})}
                              placeholder="Context for this specific section..."
                              className="w-full h-24 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary focus:bg-white/10 outline-none resize-none custom-scrollbar transition-all text-white font-medium"
                            />
                          </Field>
                        </>
                      )}

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary border-b border-white/10 pb-4">
                          {formData.product_type === 'course' ? 'Media & Assets (Upload or URL)' : 'Notes Asset (Upload or URL)'}
                        </h3>
                        
                        {formData.product_type === 'course' && (
                          <>
                            <Field label="Main Video">
                              <div className="flex gap-4">
                                <input
                                  type="url"
                                  value={formData.video_url}
                                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                                  placeholder="Provide URL..."
                                  className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-primary outline-none transition-all text-white font-medium text-sm"
                                />
                                <label className="flex items-center justify-center px-4 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer border border-primary/30">
                                  <UploadCloud size={16} className="mr-2" /> Upload
                                  <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={(e) => setVideoFile(e.target.files[0])} />
                                </label>
                              </div>
                              {videoFile && <p className="text-xs text-green-400 mt-2 font-medium bg-green-500/10 inline-block px-3 py-1 rounded-full">Will Upload: {videoFile.name}</p>}
                            </Field>

                            <Field label="Subtitles (.vtt)">
                              <div className="flex gap-4">
                                <input
                                  type="url"
                                  value={formData.subtitle_url || ''}
                                  onChange={(e) => setFormData({...formData, subtitle_url: e.target.value})}
                                  placeholder="Provide VTT URL..."
                                  className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-primary outline-none transition-all text-white font-medium text-sm"
                                />
                                <label className="flex items-center justify-center px-4 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer border border-primary/30">
                                  <UploadCloud size={16} className="mr-2" /> Upload
                                  <input type="file" accept=".vtt" className="hidden" onChange={(e) => setSubtitleFile(e.target.files[0])} />
                                </label>
                              </div>
                              {subtitleFile && <p className="text-xs text-green-400 mt-2 font-medium bg-green-500/10 inline-block px-3 py-1 rounded-full">Will Upload: {subtitleFile.name}</p>}
                            </Field>
                          </>
                        )}

                        <Field label="Notes Document (.pdf)">
                          <div className="flex gap-4">
                            <input
                              type="url"
                              value={formData.pdf_url}
                              onChange={(e) => setFormData({...formData, pdf_url: e.target.value})}
                              placeholder="Provide PDF URL..."
                              className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-primary outline-none transition-all text-white font-medium text-sm"
                            />
                            <label className="flex items-center justify-center px-4 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer border border-primary/30">
                              <UploadCloud size={16} className="mr-2" /> Upload
                              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files[0])} />
                            </label>
                          </div>
                          {pdfFile && <p className="text-xs text-green-400 mt-2 font-medium bg-green-500/10 inline-block px-3 py-1 rounded-full">Will Upload: {pdfFile.name}</p>}
                        </Field>
                      </div>
                    </div>
                  )}

                </div>

                <div className="p-6 bg-black/40 border-t border-white/5 flex gap-4 shrink-0 z-20 backdrop-blur-xl">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {isBusy ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Content</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContiCMS;
