import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreatorBadge } from '@/components/ui/SocialBadges';
import GlassSelect from '../components/GlassSelect';
import { useSearchParams, Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Plus,
  Save,
  Settings,
  User,
  FolderGit2,
  Globe,
  Link as LinkIcon,
  Phone,
  Upload,
  Camera,
  Trash2,
  ExternalLink,
  History,
  Activity,
  Search,
  GraduationCap,
  Briefcase,
  Target,
  Mail,
  Lock,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { supabase, withTimeout, uploadFile } from '../lib/supabase';
import SignatureButton from '../components/SignatureButton';
import { X as CloseIcon } from 'lucide-react';
import { generateInvoicePDF } from '../lib/invoiceGenerator';

const INITIAL_SIGNUP = {
  username: '',
  fullName: '',
  phone: '',
  avatarUrl: '',
  linkedin: '',
  github: '',
  linktree: '',
  user_type: '',
  user_subtype: '',
};

const INITIAL_POST = {
  title: '',
  submission_type: 'project',
  summary: '',
  content_url: '',
  cover_image: '',
};

const StudentZone = () => {
  const [searchParams] = useSearchParams();
  const { showAlert, showConfirm } = useAlert();
  const { user, login, signup, logout, role, profile, refreshProfile, loading: authLoading, resetPassword, deleteAccount, signInWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');
  const [signupStep, setSignupStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupData, setSignupData] = useState(INITIAL_SIGNUP);

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isBusy, setIsBusy] = useState(false);

  const [editableProfile, setEditableProfile] = useState(null);
  const [publicPosts, setPublicPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [myPayments, setMyPayments] = useState([]);
  const [postForm, setPostForm] = useState(INITIAL_POST);
  const [loadingData, setLoadingData] = useState(true);

  const isStudent = role === 'student' || role === 'admin';

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (!requestedTab) return;

    if (requestedTab === 'dashboard' || requestedTab === 'settings' || requestedTab === 'publish' || requestedTab === 'payments') {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    setSignupStep(1);
    setMessage({ text: '', type: '' });
  }, [authMode]);

  useEffect(() => {
    if (profile) {
      let socials = profile.social_links;
      if (socials && !Array.isArray(socials)) {
        // Migration: Convert { linkedin: '...', ... } to [{ platform: 'LinkedIn', url: '...' }, ...]
        socials = Object.entries(socials)
          .filter(([_, url]) => !!url)
          .map(([platform, url]) => ({
            platform: platform.charAt(0).toUpperCase() + platform.slice(1),
            url
          }));
      }
      setEditableProfile({ ...profile, social_links: socials || [] });
    } else {
      setEditableProfile(null);
    }
  }, [profile]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        await withTimeout(
          Promise.all([fetchPublicPosts(), user ? fetchMyPosts() : Promise.resolve(), user ? fetchMyPayments() : Promise.resolve()]),
          10000,
          'Connection timed out. Trying to fetch the latest work...'
        );
      } catch (err) {
        console.error("StudentZone Data Error:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user]);

  const fetchPublicPosts = async () => {
    const { data, error } = await supabase
      .from('student_submissions')
      .select('*')
      .eq('is_pushed', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load public submissions:', error);
      return;
    }

    const authorIds = [...new Set((data || []).map((item) => item.author_id).filter(Boolean))];
    let profilesMap = {};

    if (authorIds.length) {
      const { data: authorProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', authorIds);

      profilesMap = (authorProfiles || []).reduce((acc, row) => {
        acc[row.id] = row;
        return acc;
      }, {});
    }

    const withAuthors = (data || []).map((item) => ({
      ...item,
      author_profile: profilesMap[item.author_id] || null,
    }));

    setPublicPosts(withAuthors);
  };

  const fetchMyPosts = async () => {
    if (!user?.id) {
      setMyPosts([]);
      return;
    }

    const { data, error } = await supabase
      .from('student_submissions')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load my submissions:', error);
      return;
    }

    setMyPosts(data || []);
  };

  const fetchMyPayments = async () => {
    if (!user?.id) {
      setMyPayments([]);
      return;
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load my payments:', error);
      return;
    }

    setMyPayments(data || []);
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (authMode === 'signup') {
      if (signupStep === 1) {
        if (!signupData.fullName || !signupData.username || !signupData.phone) {
          setMessage({ text: 'Please fill in all identity fields.', type: 'error' });
          return;
        }
        setMessage({ text: '', type: '' });
        setSignupStep(2);
        return;
      }
      if (signupStep === 2) {
        if (!email || !password) {
          setMessage({ text: 'Please fill in your email and password.', type: 'error' });
          return;
        }
        setMessage({ text: '', type: '' });
        setSignupStep(3);
        return;
      }
      if (signupStep === 3) {
        if (!signupData.user_type) {
          setMessage({ text: 'Please select your profile persona track.', type: 'error' });
          return;
        }
        setMessage({ text: '', type: '' });
        setSignupStep(4);
        return;
      }
    }

    setIsBusy(true);
    setMessage({ text: '', type: '' });

    try {
      if (authMode === 'login') {
        await login(email, password);
        setMessage({ text: 'Logged in successfully.', type: 'success' });
      } else {
        if (!signupData.username || !signupData.fullName || !signupData.phone) {
          throw new Error('Username, full name, and phone number are required.');
        }
        if (!signupData.user_type) {
          throw new Error('Please select your profile persona track.');
        }
        if ((signupData.user_type === 'student' || signupData.user_type === 'aspirant') && !signupData.user_subtype) {
          throw new Error('Please select your specific sub-track.');
        }

        await signup(email, password, {
          username: signupData.username,
          fullName: signupData.fullName,
          phone: signupData.phone,
          avatarUrl: signupData.avatarUrl,
          socialLinks: {
            linkedin: signupData.linkedin,
            github: signupData.github,
            linktree: signupData.linktree,
          },
          user_type: signupData.user_type,
          user_subtype: signupData.user_subtype,
        });

        setMessage({ text: 'Signup successful. Check your email for verification.', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Authentication failed.', type: 'error' });
    } finally {
      setIsBusy(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    if (!user?.id || !editableProfile) return;

    setIsBusy(true);
    setMessage({ text: '', type: '' });
    try {
      const payload = {
        id: user.id,
        username: editableProfile.username || null,
        full_name: editableProfile.full_name || null,
        phone: editableProfile.phone || null,
        avatar_url: editableProfile.avatar_url || null,
        cover_url: editableProfile.cover_url || null,
        education: editableProfile.education || [],
        social_links: editableProfile.social_links || [],
        bio: editableProfile.bio || null,
        institution: editableProfile.institution || null,
        major: editableProfile.major || null,
        location: editableProfile.location || null,
        portfolio_url: editableProfile.portfolio_url || null,
        gender: editableProfile.gender || null,
        extra_details: {
          ...(editableProfile.extra_details || {}),
        },
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(payload);
      if (error) throw error;

      await refreshProfile();
      setMessage({ text: 'Profile updated successfully.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Profile update failed.', type: 'error' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select an image file.', type: 'error' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'Image size should be less than 2MB.', type: 'error' });
      return;
    }

    setIsBusy(true);
    setMessage({ text: '', type: '' });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setEditableProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      setMessage({ text: 'Avatar uploaded! Click "Save Profile" to apply changes.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Upload failed.', type: 'error' });
    } finally {
      setIsBusy(false);
    }
  };

  const addEducation = () => {
    const newEdu = { school: '', degree: '', year: '' };
    setEditableProfile(prev => ({
      ...prev,
      education: [...(prev.education || []), newEdu]
    }));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...(editableProfile.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditableProfile(prev => ({ ...prev, education: updated }));
  };

  const removeEducation = (index) => {
    const updated = (editableProfile.education || []).filter((_, i) => i !== index);
    setEditableProfile(prev => ({ ...prev, education: updated }));
  };

  const addSocial = () => {
    const newSocial = { platform: 'LinkedIn', url: '' };
    setEditableProfile(prev => ({
      ...prev,
      social_links: [...(prev.social_links || []), newSocial]
    }));
  };

  const updateSocial = (index, field, value) => {
    const updated = [...(editableProfile.social_links || [])];
    updated[index] = { ...updated[index], [field]: value };
    setEditableProfile(prev => ({ ...prev, social_links: updated }));
  };

  const removeSocial = (index) => {
    const updated = (editableProfile.social_links || []).filter((_, i) => i !== index);
    setEditableProfile(prev => ({ ...prev, social_links: updated }));
  };

  const updateTaskStatus = async (taskIndex, newStatus) => {
    if (!profile || !user?.id) return;
    
    setIsBusy(true);
    try {
      const currentTasks = profile.extra_details?.academics?.tasks || [];
      const updatedTasks = [...currentTasks];
      updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: newStatus };
      
      const newExtraDetails = {
        ...(profile.extra_details || {}),
        academics: {
          ...(profile.extra_details?.academics || {}),
          tasks: updatedTasks
        }
      };

      const { error } = await supabase
        .from('profiles')
        .update({ extra_details: newExtraDetails })
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
      showAlert('Task status updated.', 'success');
    } catch (err) {
      showAlert(err.message || 'Failed to update task.', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  const submitPost = async (e) => {
    e.preventDefault();
    if (!user?.id || !isStudent) return;

    setIsBusy(true);
    setMessage({ text: '', type: '' });

    try {
      // 1. Handle File Uploads if they are actual File objects
      let coverUrl = postForm.cover_image;
      let contentUrl = postForm.content_url;

      if (postForm.cover_file) {
        coverUrl = await uploadFile(supabase, 'avatars', `submissions/${user.id}/covers`, postForm.cover_file);
      }
      if (postForm.content_file) {
        contentUrl = await uploadFile(supabase, 'avatars', `submissions/${user.id}/files`, postForm.content_file);
      }

      const payload = {
        author_id: user.id,
        title: postForm.title,
        submission_type: postForm.submission_type,
        summary: postForm.summary,
        content_url: contentUrl || null,
        cover_image: coverUrl || null,
        moderation_status: 'on_hold',
        is_pushed: false,
      };

      const { error } = await supabase.from('student_submissions').insert([payload]);
      if (error) throw error;

      setPostForm(INITIAL_POST);
      await Promise.all([fetchMyPosts(), fetchPublicPosts()]);
      setMessage({ text: 'Submission added and sent for admin review (on hold).', type: 'success' });
      setActiveTab('dashboard');
    } catch (err) {
      setMessage({ text: err.message || 'Failed to submit item.', type: 'error' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email && !user?.email) {
      setMessage({ text: 'Enter your email first.', type: 'error' });
      return;
    }

    setIsBusy(true);
    try {
      await resetPassword(user?.email || email);
      setMessage({ text: 'Password reset email sent.', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Failed to send reset email.', type: 'error' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMessage({ type: 'success', text: 'Signed out successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to sign out. Please try again.' });
    }
  };

  const handleDeleteAccount = async () => {
    showConfirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently erase your profile.",
      async () => {
        setIsBusy(true);
        try {
          await deleteAccount();
        } catch (err) {
          showAlert(err.message, "error");
        } finally {
          setIsBusy(false);
        }
      }
    );
  };

  const stats = useMemo(() => {
    const pushed = myPosts.filter((p) => p.is_pushed).length;
    const onHold = myPosts.filter((p) => !p.is_pushed).length;
    return {
      total: myPosts.length,
      pushed,
      onHold,
    };
  }, [myPosts]);

  const purchasedCourses = useMemo(() => myPayments.filter(p => p.status === 'paid' && p.purpose.includes('[Course]')), [myPayments]);
  const purchasedServices = useMemo(() => myPayments.filter(p => p.status === 'paid' && p.purpose.includes('[Service]')), [myPayments]);
  const purchasedAcademics = useMemo(() => myPayments.filter(p => p.status === 'paid' && p.purpose.includes('[Academic]')), [myPayments]);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {!user ? (
        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-8 md:p-12 rounded-[40px] bg-card border border-border shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Plus size={200} className="rotate-45" />
            </div>
            <div className="relative z-10 space-y-6 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-animate-gradient">
                The Student <br /> Creative Hub
              </h2>
              <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                Publish your research papers, showcase your engineering projects, and build your professional legacy in the 5EVEN Student Zone.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <button 
                  onClick={() => {
                    const authElement = document.getElementById('auth-section');
                    if (authElement) authElement.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="px-8 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                  Join & Submit Your Work
                </button>
                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-muted/50 border border-border text-xs font-black uppercase tracking-widest text-muted-foreground">
                  <CheckCircle2 size={16} className="text-green-500" />
                  Peer Reviewed & Moderated
                </div>
              </div>
            </div>
          </motion.div>

          <div id="auth-section" className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12">
            <div className="space-y-6">
               <h3 className="text-3xl font-black uppercase tracking-tighter italic">Authentication Required</h3>
               <p className="text-muted-foreground">Log in or create a student account to access the submission portal, track your academic tasks, and manage your public profile.</p>
               <div className="space-y-4">
                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
                   <div className="p-3 rounded-xl bg-primary/10 text-primary"><User size={20} /></div>
                   <div>
                     <p className="font-bold text-sm uppercase tracking-tight">Personalized Profile</p>
                     <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Showcase your skills to the world</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
                   <div className="p-3 rounded-xl bg-primary/10 text-primary"><Plus size={20} /></div>
                   <div>
                     <p className="font-bold text-sm uppercase tracking-tight">Unlimited Submissions</p>
                     <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Share papers, projects, and insights</p>
                   </div>
                 </div>
               </div>
            </div>

            <div className="p-8 rounded-[32px] bg-card border border-border shadow-2xl">
              <div className="flex items-center gap-4 mb-8 p-1 bg-muted rounded-2xl">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${authMode === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Sign Up
                </button>
              </div>
              {authMode === 'signup' && (
                <div className="flex items-center justify-between mb-8 relative px-2">
                  {/* Background Track Line */}
                  <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-border/40 -translate-y-1/2 z-0" />
                  {/* Active Progress Line */}
                  <div 
                    className="absolute top-1/2 left-4 h-[2px] bg-gradient-to-r from-primary to-violet-500 -translate-y-1/2 z-0 transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]" 
                    style={{ width: `${((signupStep - 1) / 3) * 88}%` }}
                  />
                  
                  {[
                    { step: 1, label: 'Identity' },
                    { step: 2, label: 'Access' },
                    { step: 3, label: 'Track' },
                    { step: 4, label: 'Specialty' }
                  ].map((s) => (
                    <div key={s.step} className="flex flex-col items-center relative z-10">
                      <motion.div 
                        animate={{
                          scale: signupStep === s.step ? 1.15 : 1.0,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border transition-all duration-300 ${
                          signupStep === s.step 
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' 
                            : signupStep > s.step 
                              ? 'bg-foreground border-foreground text-background' 
                              : 'bg-background border-border text-muted-foreground'
                        }`}
                      >
                        {signupStep > s.step ? '✓' : s.step}
                      </motion.div>
                      <span className={`text-[8px] font-black uppercase tracking-widest mt-2 hidden sm:block ${signupStep === s.step ? 'text-primary' : 'text-muted-foreground'}`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' ? (
                  <AnimatePresence mode="wait">
                    {signupStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center space-y-1 mb-4">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-1.5">
                            <User size={12} /> Step 1: Create Operative Profile
                          </h4>
                          <p className="text-[9px] text-muted-foreground uppercase font-medium">Define your username and identity credentials.</p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={signupData.fullName}
                              onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-xs transition-colors"
                              placeholder="John Doe"
                            />
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={signupData.username}
                              onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-xs transition-colors"
                              placeholder="johndoe"
                            />
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xs">@</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Phone</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={signupData.phone}
                              onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-xs transition-colors"
                              placeholder="+91 ..."
                            />
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-4 bg-foreground text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-1.5"
                        >
                          Next: Account Access <ArrowRight size={14} />
                        </button>
                      </motion.div>
                    )}

                    {signupStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center space-y-1 mb-4">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-1.5">
                            <Mail size={12} /> Step 2: Security & Access
                          </h4>
                          <p className="text-[9px] text-muted-foreground uppercase font-medium">Verify your network entry point and password.</p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-xs transition-colors"
                              placeholder="email@example.com"
                            />
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                          <div className="relative">
                            <input
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-xs transition-colors"
                              placeholder="••••••••"
                            />
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <button
                            type="button"
                            onClick={() => setSignupStep(1)}
                            className="flex-1 py-4 border border-border text-foreground rounded-xl font-black uppercase tracking-widest text-xs hover:bg-muted active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                          >
                            <ArrowLeft size={14} /> Back
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-4 bg-foreground text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                          >
                            Next: Profile Track <ArrowRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {signupStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="text-center space-y-1 mb-4">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center justify-center gap-1.5">
                            <Sparkles size={12} className="animate-pulse" /> Step 3: Choose Profile Persona Track
                          </h4>
                          <p className="text-[9px] text-muted-foreground uppercase font-medium">Select your professional or academic track.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {/* Student Card */}
                          <motion.button
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={() => setSignupData(prev => ({ ...prev, user_type: 'student', user_subtype: '' }))}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 relative overflow-hidden ${
                              signupData.user_type === 'student'
                                ? 'border-violet-500 bg-violet-500/5 shadow-[0_0_20px_-5px_rgba(139,92,246,0.2)]'
                                : 'border-border bg-card/50 hover:border-violet-500/40'
                            }`}
                          >
                            {signupData.user_type === 'student' && (
                              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
                            )}
                            <div className={`p-2.5 rounded-xl border transition-colors ${
                              signupData.user_type === 'student'
                                ? 'border-violet-500/30 bg-violet-500/10 text-violet-400'
                                : 'border-border bg-background text-muted-foreground'
                            }`}>
                              <GraduationCap size={20} />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                Student
                                {signupData.user_type === 'student' && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />}
                              </h5>
                              <p className="text-[9px] text-muted-foreground mt-0.5 font-medium leading-relaxed">School, college, or university tracks</p>
                            </div>
                            {signupData.user_type === 'student' && (
                              <div className="text-violet-400 font-bold text-xs self-center">✓</div>
                            )}
                          </motion.button>

                          {/* Working Professional Card */}
                          <motion.button
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={() => setSignupData(prev => ({ ...prev, user_type: 'professional', user_subtype: '' }))}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 relative overflow-hidden ${
                              signupData.user_type === 'professional'
                                ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]'
                                : 'border-border bg-card/50 hover:border-amber-500/40'
                            }`}
                          >
                            {signupData.user_type === 'professional' && (
                              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                            )}
                            <div className={`p-2.5 rounded-xl border transition-colors ${
                              signupData.user_type === 'professional'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                : 'border-border bg-background text-muted-foreground'
                            }`}>
                              <Briefcase size={20} />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                Working Professional
                                {signupData.user_type === 'professional' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                              </h5>
                              <p className="text-[9px] text-muted-foreground mt-0.5 font-medium leading-relaxed">Industry, research, enterprise engineering</p>
                            </div>
                            {signupData.user_type === 'professional' && (
                              <div className="text-amber-400 font-bold text-xs self-center">✓</div>
                            )}
                          </motion.button>

                          {/* Aspirant Card */}
                          <motion.button
                            whileHover={{ y: -2, scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={() => setSignupData(prev => ({ ...prev, user_type: 'aspirant', user_subtype: '' }))}
                            className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 relative overflow-hidden ${
                              signupData.user_type === 'aspirant'
                                ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]'
                                : 'border-border bg-card/50 hover:border-emerald-500/40'
                            }`}
                          >
                            {signupData.user_type === 'aspirant' && (
                              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                            )}
                            <div className={`p-2.5 rounded-xl border transition-colors ${
                              signupData.user_type === 'aspirant'
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                : 'border-border bg-background text-muted-foreground'
                            }`}>
                              <Target size={20} />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
                                Aspirant
                                {signupData.user_type === 'aspirant' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                              </h5>
                              <p className="text-[9px] text-muted-foreground mt-0.5 font-medium leading-relaxed">Preparing for competitive exams or jobs</p>
                            </div>
                            {signupData.user_type === 'aspirant' && (
                              <div className="text-emerald-400 font-bold text-xs self-center">✓</div>
                            )}
                          </motion.button>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <button
                            type="button"
                            onClick={() => setSignupStep(2)}
                            className="flex-1 py-4 border border-border text-foreground rounded-xl font-black uppercase tracking-widest text-xs hover:bg-muted active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                          >
                            <ArrowLeft size={14} /> Back
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-4 bg-foreground text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                          >
                            Next: Specialty <ArrowRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {signupStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {/* Student Specialty */}
                        {signupData.user_type === 'student' && (
                          <div className="space-y-4">
                            <div className="text-center space-y-1 mb-4">
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-violet-400 flex items-center justify-center gap-1.5">
                                <GraduationCap size={12} /> Student Specialization
                              </h4>
                              <p className="text-[9px] text-muted-foreground uppercase font-medium">Select your current educational level.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { value: 'school', title: 'School', desc: 'Primary or high school student' },
                                { value: 'college', title: 'College', desc: 'University or college academic level' },
                                { value: 'other', title: 'Other', desc: 'Specialized academy or research' }
                              ].map((sub) => (
                                <motion.button
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={sub.value}
                                  type="button"
                                  onClick={() => setSignupData(prev => ({ ...prev, user_subtype: sub.value }))}
                                  className={`p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                                    signupData.user_subtype === sub.value
                                      ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_-5px_rgba(139,92,246,0.3)]'
                                      : 'border-border bg-card/40 hover:border-violet-500/30'
                                  }`}
                                >
                                  <span className="text-xs font-black uppercase tracking-wider text-foreground">{sub.title}</span>
                                  <span className="text-[8px] text-muted-foreground leading-normal font-medium">{sub.desc}</span>
                                  {signupData.user_subtype === sub.value && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1" />
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Aspirant Specialty */}
                        {signupData.user_type === 'aspirant' && (
                          <div className="space-y-4">
                            <div className="text-center space-y-1 mb-4">
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
                                <Target size={12} /> Preparation Track
                              </h4>
                              <p className="text-[9px] text-muted-foreground uppercase font-medium">Select your primary preparation objective.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { value: 'competitive exam', title: 'Competitive Exam', desc: 'JEE, NEET, GATE, Civil Services, etc.' },
                                { value: 'job interview', title: 'Job Interview', desc: 'Corporate, tech, coding placement interviews' },
                                { value: 'other', title: 'Other', desc: 'Career changes or general preparation' }
                              ].map((sub) => (
                                <motion.button
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  key={sub.value}
                                  type="button"
                                  onClick={() => setSignupData(prev => ({ ...prev, user_subtype: sub.value }))}
                                  className={`p-4 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                                    signupData.user_subtype === sub.value
                                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]'
                                      : 'border-border bg-card/40 hover:border-emerald-500/30'
                                  }`}
                                >
                                  <span className="text-xs font-black uppercase tracking-wider text-foreground">{sub.title}</span>
                                  <span className="text-[8px] text-muted-foreground leading-normal font-medium">{sub.desc}</span>
                                  {signupData.user_subtype === sub.value && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1" />
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Working Professional specialty (no subtypes needed, show final preview card) */}
                        {signupData.user_type === 'professional' && (
                          <div className="space-y-4">
                            <div className="text-center space-y-1 mb-4">
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
                                <Briefcase size={12} /> Professional Credentials
                              </h4>
                              <p className="text-[9px] text-muted-foreground uppercase font-medium">Verify your profile metadata summary.</p>
                            </div>

                            <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 space-y-3 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-400">Operative Verification Profile</h5>
                              <div className="space-y-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                <p>Role Type: <span className="text-foreground">Working Professional</span></p>
                                <p>Full Name: <span className="text-foreground">{signupData.fullName}</span></p>
                                <p>Username: <span className="text-foreground">@{signupData.username}</span></p>
                                <p>Phone: <span className="text-foreground">{signupData.phone}</span></p>
                              </div>
                              <p className="text-[9px] text-muted-foreground font-medium italic mt-2">"As a working professional, you gain access to network resource portfolios, enterprise forums, and advisory channels."</p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-4">
                          <button
                            type="button"
                            onClick={() => setSignupStep(3)}
                            className="flex-1 py-4 border border-border text-foreground rounded-xl font-black uppercase tracking-widest text-xs hover:bg-muted active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                          >
                            <ArrowLeft size={14} /> Back
                          </button>
                          <button
                            type="submit"
                            disabled={isBusy}
                            className="flex-1 py-4 bg-foreground text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg"
                          >
                            {isBusy ? <Loader2 className="animate-spin mx-auto" size={16} /> : (
                              <>
                                <span>Register Account</span>
                                <ChevronRight size={14} />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full py-4 bg-foreground text-background rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all disabled:opacity-50 mt-4"
                    >
                      {isBusy ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Login'}
                    </button>
                  </>
                )}
                
                {message.text && (
                  <div className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
                    {message.text}
                  </div>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border"></span>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase">
                    <span className="bg-card px-4 text-muted-foreground tracking-[0.3em]">Or Secure Access</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setIsBusy(true);
                    setMessage({ text: '', type: '' });
                    try {
                      await signInWithGoogle();
                    } catch (error) {
                      setMessage({ text: error.message || 'Google login failed', type: 'error' });
                    } finally {
                      setIsBusy(false);
                    }
                  }}
                  disabled={isBusy}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl border border-border bg-white/5 hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
                >
                  <i className="ri-google-fill text-lg"></i>
                  <span>Continue with Google</span>
                </button>
              </form>
            </div>
          </div>
          
          <div className="pt-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tight italic">Public Exhibition</h3>
              <div className="h-px flex-1 bg-border mx-8 hidden md:block" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-4 py-1.5 rounded-full border border-border">
                Live Feed
              </span>
            </div>
            <PublicFeed loadingData={loadingData} posts={publicPosts} />
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
          <aside className="space-y-4">
            <nav className="flex flex-col gap-2">
              <TabButton icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
                Dashboard
              </TabButton>
              <TabButton icon={Globe} active={activeTab === 'explore'} onClick={() => setActiveTab('explore')}>
                Explore Hall
              </TabButton>
              <TabButton icon={Activity} active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
                Payments & Alerts
              </TabButton>
              <TabButton icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
                Profile Settings
              </TabButton>
              {isStudent && (
                <TabButton icon={Upload} active={activeTab === 'publish'} onClick={() => setActiveTab('publish')}>
                  Publish Work
                </TabButton>
              )}
            </nav>
          </aside>

          <main className="space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div key="dashboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[40px] bg-primary/5 border border-primary/10 shadow-inner">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-primary">Student Dashboard</h3>
                        <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                          ID: {profile?.extra_details?.id_number || '70326-0001'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Management & Directive Controls</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {profile?.username && (
                        <Link 
                          to={`/profile/${profile.username}`}
                          className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-foreground font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-white/10 transition-all"
                        >
                          <ExternalLink size={18} />
                          View Public Profile
                        </Link>
                      )}
                      <button 
                        type="button"
                        onClick={() => setActiveTab('publish')}
                        className="px-8 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                      >
                        <Plus size={18} />
                        Submit New Work
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="My Submissions" value={String(stats.total)} />
                    <StatCard title="Pushed" value={String(stats.pushed)} />
                    <StatCard title="On Hold" value={String(stats.onHold)} />
                  </div>

                  {/* My Digital Access Section */}
                  {(purchasedCourses.length > 0 || purchasedServices.length > 0 || purchasedAcademics.length > 0) && (
                    <div className="p-8 rounded-[40px] border border-primary/20 bg-card shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FolderGit2 size={120} className="rotate-12" />
                      </div>
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-black italic tracking-tighter uppercase text-animate-gradient">My Digital Access</h3>
                          <span className="px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            Purchased Products
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          {[
                            ...purchasedCourses.map(item => {
                              const title = item.purpose.replace(/\[.*?\]\s*/g, '');
                              return { ...item, category: 'Course', link: `/learn/course/${encodeURIComponent(title)}` };
                            }),
                            ...purchasedServices.map(item => ({ ...item, category: 'Service', link: '/services' })), // Services might still redirect to main since no viewer yet
                            ...purchasedAcademics.map(item => ({ ...item, category: 'Academic', link: '/academics' })), // Same for academics
                            // Handle Notes if present in payments
                            ...myPayments.filter(p => p.status === 'paid' && p.purpose.includes('[Note]')).map(item => {
                              const title = item.purpose.replace(/\[.*?\]\s*/g, '');
                              return { ...item, category: 'Note', link: `/learn/note/${encodeURIComponent(title)}` };
                            })
                          ].map((item, idx) => {
                            const title = item.purpose.replace(/\[.*?\]\s*/g, '');
                            return (
                              <div key={idx} className="p-5 rounded-2xl border border-border bg-background/50 hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                      {item.category}
                                    </span>
                                  </div>
                                  <p className="font-bold text-lg leading-tight uppercase tracking-tight">{title}</p>
                                </div>
                                <Link 
                                  to={item.link}
                                  className="px-6 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                  Access Product <ExternalLink size={14} />
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tasks Manifesto Section */}
                  {profile?.extra_details?.academics?.tasks?.length > 0 && (
                    <div className="p-8 rounded-[40px] border border-primary/20 bg-card shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText size={120} className="rotate-12" />
                      </div>
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-black italic tracking-tighter uppercase text-animate-gradient">Tasks Manifesto</h3>
                          <span className="px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            Academic Directives
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {profile.extra_details.academics.tasks.map((task, idx) => (
                            <div key={idx} className="p-5 rounded-2xl border border-border bg-background/50 hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <div className={`mt-1 w-3 h-3 rounded-full shrink-0 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)] ${
                                  task.status === 'Done' ? 'bg-green-500 shadow-green-500/50' : 
                                  task.status === 'In Progress' ? 'bg-amber-500 shadow-amber-500/50' : 
                                  'bg-primary'
                                }`} />
                                <div>
                                  <p className="font-bold text-lg leading-tight uppercase tracking-tight">{task.title}</p>
                                  <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">{task.deadline || 'No Deadline'}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <GlassSelect
                                  value={task.status || 'Pending'}
                                  onChange={(val) => updateTaskStatus(idx, val)}
                                  options={['Pending', 'In Progress', 'Done']}
                                  className="w-36 h-10"
                                />
                                {task.status !== 'Done' && (
                                  <button 
                                    onClick={() => {
                                      setPostForm({ ...INITIAL_POST, title: `Submission for: ${task.title}` });
                                      setActiveTab('publish');
                                    }}
                                    className="px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
                                  >
                                    Submit Work
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6 rounded-3xl border border-border bg-card shadow-xl">
                    <h3 className="text-xl font-black mb-4">My Submission Status</h3>
                    {myPosts.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No submissions yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {myPosts.map((item) => (
                          <div key={item.id} className="p-4 rounded-2xl border border-border bg-background flex items-center justify-between gap-4">
                            <div>
                              <p className="font-bold">{item.title}</p>
                              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{item.submission_type}</p>
                            </div>
                            <StatusBadge pushed={item.is_pushed} status={item.moderation_status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="p-6 rounded-3xl border border-border bg-card shadow-xl">
                    <h3 className="text-xl font-black mb-4">Payment History & Alerts</h3>
                    {myPayments.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No payments found.</p>
                    ) : (
                      <div className="space-y-3">
                        {myPayments.map((item) => (
                          <div key={item.id} className="p-4 rounded-2xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group">
                            {item.status === 'paid' && <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full pointer-events-none" />}
                            <div>
                              <p className="font-bold text-lg">₹{item.amount}</p>
                              {(() => {
                                const cleanPurpose = item.purpose ? item.purpose.replace(/\[.*?\]\s*/g, '').trim() : '';
                                const isCourse = item.purpose ? item.purpose.toLowerCase().includes('[course]') : false;
                                const isNote = item.purpose ? item.purpose.toLowerCase().includes('[note]') : false;
                                const hasCert = item.purpose ? item.purpose.toLowerCase().includes('[cert]') : false;
                                return (
                                  <div className="flex flex-col gap-1.5 mt-1">
                                    <p className="text-sm font-bold text-foreground">{cleanPurpose}</p>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {isCourse && (
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                                          Course
                                        </span>
                                      )}
                                      {isNote && (
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                                          Study Material
                                        </span>
                                      )}
                                      {hasCert && (
                                        <span className="px-2 py-0.5 rounded text-[8px] font-black bg-secondary/10 text-secondary border border-secondary/20 uppercase tracking-wider">
                                          Certification Included
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                              <div className="flex items-center gap-4 flex-wrap mt-2">
                                <p className="text-[10px] text-muted-foreground opacity-50 uppercase tracking-widest">TXN ID: {item.transaction_id}</p>
                                <button 
                                  onClick={async () => await generateInvoicePDF(item, profile || { full_name: user?.email?.split('@')[0], email: user?.email })}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20 hover:bg-primary hover:text-white hover:border-primary active:scale-[0.98] transition-all duration-300"
                                >
                                  <FileText size={10} /> {item.status === 'paid' ? 'Tax Invoice' : 'Proforma Bill'}
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                  item.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                  item.status === 'unpaid' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                  {item.status}
                              </span>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'explore' && (
                <motion.div key="explore" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black uppercase tracking-tighter italic">Explore Hall</h3>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">A compilation of peer-reviewed student excellence</p>
                    </div>
                    <div className="flex-1 max-w-md">
                      {/* Placeholder for Search if needed */}
                    </div>
                  </div>
                  
                  <div className="h-px bg-border w-full" />
                  
                  <PublicFeed loadingData={loadingData} posts={publicPosts} />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {!editableProfile ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-card/40 rounded-3xl border border-border">
                       <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                       <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Loading Profile Data...</p>
                    </div>
                  ) : (
                    <form onSubmit={updateProfile} className="space-y-5 p-6 rounded-3xl border border-border bg-card shadow-xl">
                    <h3 className="text-xl font-black">Profile Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Username">
                        <input
                          type="text"
                          value={editableProfile.username || ''}
                          onChange={(e) => setEditableProfile((p) => ({ ...p, username: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        />
                      </Field>
                      <Field label="Full Name">
                        <input
                          type="text"
                          value={editableProfile.full_name || ''}
                          onChange={(e) => setEditableProfile((p) => ({ ...p, full_name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                          required
                        />
                      </Field>
                      <Field label="Phone">
                        <input
                          type="text"
                          value={editableProfile.phone || ''}
                          onChange={(e) => setEditableProfile((p) => ({ ...p, phone: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        />
                      </Field>
                      <Field label="Gender">
                        <GlassSelect
                          value={editableProfile.gender || ''}
                          onChange={(val) => setEditableProfile((p) => ({ 
                            ...p, 
                            gender: val 
                          }))}
                          options={[
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'others', label: 'Others' }
                          ]}
                          placeholder="Select Gender"
                          className="w-full"
                        />
                      </Field>
                      <Field label="Email (read-only)">
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground"
                        />
                      </Field>
                      <Field label="Avatar">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-background border border-border">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border-2 border-primary/20">
                            {editableProfile.avatar_url ? (
                              <img src={editableProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <Camera size={24} className="text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-colors">
                              <Upload size={14} />
                              <span>Upload Photo</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isBusy} />
                            </label>
                            <p className="text-[10px] text-muted-foreground mt-1.5 font-medium uppercase tracking-tight">JPG, PNG or GIF. Max 2MB.</p>
                          </div>
                        </div>
                      </Field>
                      <Field label="Bio / Slogan">
                        <textarea
                          value={editableProfile.bio || ''}
                          onChange={(e) => setEditableProfile((p) => ({ ...p, bio: e.target.value }))}
                          placeholder="Short slogan or professional summary..."
                          className="w-full h-[88px] px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none"
                        />
                      </Field>
                      <Field label="Institution">
                        <input
                          type="text"
                          value={editableProfile.institution || ''}
                          onChange={(e) => setEditableProfile((p) => ({ ...p, institution: e.target.value }))}
                          placeholder="University / School"
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        />
                      </Field>
                      <Field label="Major / Specialization">
                        <input
                          type="text"
                          value={editableProfile.major || ''}
                          onChange={(e) => setEditableProfile((p) => ({ ...p, major: e.target.value }))}
                          placeholder="e.g. Data Science, CSE"
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        />
                      </Field>
                      <Field label="Profile Persona Type">
                        <GlassSelect
                          value={editableProfile.extra_details?.user_type || ''}
                          onChange={(val) => setEditableProfile((p) => ({
                            ...p,
                            extra_details: {
                              ...(p.extra_details || {}),
                              user_type: val,
                              user_subtype: ''
                            }
                          }))}
                          options={[
                            { value: '', label: 'Not Specified' },
                            { value: 'student', label: 'Student' },
                            { value: 'professional', label: 'Working Professional' },
                            { value: 'aspirant', label: 'Aspirant' }
                          ]}
                          className="w-full text-xs font-bold text-foreground"
                        />
                      </Field>
                      {editableProfile.extra_details?.user_type === 'student' && (
                        <Field label="Student Track Subtype">
                          <GlassSelect
                            value={editableProfile.extra_details?.user_subtype || ''}
                            onChange={(val) => setEditableProfile((p) => ({
                              ...p,
                              extra_details: {
                                ...(p.extra_details || {}),
                                user_subtype: val
                              }
                            }))}
                            options={[
                              { value: '', label: 'Select Subtype' },
                              { value: 'school', label: 'School' },
                              { value: 'college', label: 'College' },
                              { value: 'other', label: 'Other' }
                            ]}
                            className="w-full text-xs font-bold text-foreground"
                          />
                        </Field>
                      )}
                      {editableProfile.extra_details?.user_type === 'aspirant' && (
                        <Field label="Aspirant Prep Track">
                          <GlassSelect
                            value={editableProfile.extra_details?.user_subtype || ''}
                            onChange={(val) => setEditableProfile((p) => ({
                              ...p,
                              extra_details: {
                                ...(p.extra_details || {}),
                                user_subtype: val
                              }
                            }))}
                            options={[
                              { value: '', label: 'Select Track' },
                              { value: 'competitive exam', label: 'Competitive Exam' },
                              { value: 'job interview', label: 'Job Interview' },
                              { value: 'other', label: 'Other' }
                            ]}
                            className="w-full text-xs font-bold text-foreground"
                          />
                        </Field>
                      )}
                      <Field label="Location">
                        <input
                          type="text"
                          value={editableProfile.location || ''}
                          onChange={(e) => setEditableProfile((p) => ({ ...p, location: e.target.value }))}
                          placeholder="City, Country"
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        />
                      </Field>
                      <Field label="Portfolio / CV Link">
                        <div className="relative">
                          <ExternalLink size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={editableProfile.portfolio_url || ''}
                            onChange={(e) => setEditableProfile((p) => ({ ...p, portfolio_url: e.target.value }))}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                      </Field>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Plus size={14} /> Education History
                        </h4>
                        <button type="button" onClick={addEducation} className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                          Add New
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {(editableProfile.education || []).map((edu, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-background border border-border flex flex-col md:flex-row gap-4 items-start md:items-end group relative transition-all hover:border-primary/30">
                            <div className="flex-1 w-full flex flex-col gap-2">
                              <label className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">School / Institute</label>
                              <input
                                value={edu.school}
                                onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-card border border-border text-xs focus:border-primary outline-none"
                              />
                            </div>
                            <div className="flex-1 w-full flex flex-col gap-2">
                              <label className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Degree / Course</label>
                              <input
                                value={edu.degree}
                                onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-card border border-border text-xs focus:border-primary outline-none"
                              />
                            </div>
                            <div className="w-full md:w-32 flex flex-col gap-2">
                              <label className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Year</label>
                              <input
                                value={edu.year}
                                onChange={(e) => updateEducation(idx, 'year', e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-card border border-border text-xs focus:border-primary outline-none"
                              />
                            </div>
                            <button type="button" onClick={() => removeEducation(idx)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors bg-card border border-border">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                          <Plus size={14} /> Social Links (As many as you need)
                        </h4>
                        <button type="button" onClick={addSocial} className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">
                          Add New
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(Array.isArray(editableProfile.social_links) ? editableProfile.social_links : []).map((link, idx) => (
                          <div key={idx} className="p-4 rounded-2xl bg-background border border-border flex items-center gap-3 transition-all hover:border-primary/30">
                            <div className="w-32">
                              <GlassSelect
                                value={link.platform}
                                onChange={(val) => updateSocial(idx, 'platform', val)}
                                options={['LinkedIn', 'GitHub', 'Twitter/X', 'Portfolio', 'Instagram', 'Discord', 'Other']}
                                className="w-40"
                              />
                            </div>
                            <input
                              placeholder="URL"
                              value={link.url}
                              onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                              className="flex-1 px-4 py-2 rounded-xl bg-card border border-border text-xs focus:border-primary outline-none"
                            />
                            <button type="button" onClick={() => removeSocial(idx)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors bg-card border border-border">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 flex-wrap">
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="w-full md:w-auto px-6 py-3 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-lg transition-all"
                      >
                        {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Profile
                      </button>
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="px-6 py-3 rounded-xl border border-border font-black uppercase tracking-widest text-xs"
                      >
                        Reset Password
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isBusy}
                        className="px-6 py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 font-black uppercase tracking-widest text-xs transition-colors ml-auto md:ml-0"
                      >
                        Delete Account
                      </button>
                    </div>

                    {message.text && <div className="mt-4"><MessageBox type={message.type}>{message.text}</MessageBox></div>}
                  </form>
                  )}
                </motion.div>
              )}

              {activeTab === 'publish' && (
                <motion.div key="publish" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <form onSubmit={submitPost} className="space-y-4 p-6 rounded-3xl border border-border bg-card shadow-xl">
                    <h3 className="text-xl font-black">Publish Project / Research Paper</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Title">
                        <input
                          type="text"
                          value={postForm.title}
                          onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                          placeholder="Project Name..."
                          required
                        />
                      </Field>
                      <Field label="Type">
                        <GlassSelect
                          value={postForm.submission_type}
                          onChange={(val) => setPostForm({ ...postForm, submission_type: val })}
                          options={['project', 'research_paper']}
                        />
                      </Field>
                    </div>

                    <Field label="Summary">
                      <textarea
                        value={postForm.summary}
                        onChange={(e) => setPostForm({ ...postForm, summary: e.target.value })}
                        className="w-full h-24 px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none"
                        placeholder="Brief overview of your work..."
                        required
                      />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StudentFileField
                        label="Cover Image"
                        accept="image/*"
                        value={postForm.cover_image}
                        onFileSelect={(file) => setPostForm({ ...postForm, cover_file: file })}
                        onUrlChange={(url) => setPostForm({ ...postForm, cover_image: url })}
                        placeholder="Paste URL or upload image"
                      />
                      <StudentFileField
                        label="Project File / Link"
                        accept=".pdf,.zip,.rar,.docx,.doc"
                        value={postForm.content_url}
                        onFileSelect={(file) => setPostForm({ ...postForm, content_file: file })}
                        onUrlChange={(url) => setPostForm({ ...postForm, content_url: url })}
                        placeholder="Paste URL or upload PDF/ZIP"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                      >
                        {isBusy ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                        <span>Submit for Moderation</span>
                      </button>
                    </div>
                  </form>
                  {message.text && <MessageBox type={message.type}>{message.text}</MessageBox>}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </section>
      )}
    </div>
  );
};

const TabButton = ({ icon: Icon, active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${active ? 'bg-foreground text-background shadow-lg shadow-foreground/10' : 'hover:bg-card text-muted-foreground border border-border'
      }`}
  >
    <Icon size={16} />
    {children}
  </button>
);

const StudentFileField = ({ label, value, onFileSelect, onUrlChange, accept, placeholder }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</label>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none text-xs"
          />
          <label className="cursor-pointer px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all flex items-center gap-2 shrink-0">
            <Upload size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{isUploading ? '...' : 'Upload'}</span>
            <input 
              type="file" 
              accept={accept} 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFileName(file.name);
                  onFileSelect(file);
                }
              }} 
            />
          </label>
        </div>
        {selectedFileName && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-green-600 dark:text-green-400">
            <span className="truncate max-w-[200px]">Selected: {selectedFileName}</span>
            <button type="button" onClick={() => { setSelectedFileName(''); onFileSelect(null); }} className="text-green-600 hover:text-green-800"><CloseIcon size={12} /></button>
          </div>
        )}
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

const StatCard = ({ title, value }) => (
  <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</p>
    <p className="text-3xl font-black mt-1">{value}</p>
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

const PublicFeed = ({ loadingData, posts }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(p => 
      p.title?.toLowerCase().includes(q) || 
      p.summary?.toLowerCase().includes(q) ||
      p.author_profile?.full_name?.toLowerCase().includes(q) ||
      p.author_profile?.username?.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-border shadow-xl">
        <div className="flex items-center gap-3 px-4 py-2 border-r border-border hidden md:flex">
          <Globe className="text-primary" size={20} />
          <span className="text-xs font-black uppercase tracking-widest italic">Global Network</span>
        </div>
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search projects, papers, or student creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-background border border-border focus:border-primary outline-none text-sm font-medium transition-all"
          />
        </div>
      </div>

      {loadingData ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Feed...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground opacity-50">
            <Search size={32} />
          </div>
          <p className="text-muted-foreground font-medium">No matches found for your exploration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPosts.map((item) => (
            <article 
              key={item.id} 
              className="group p-6 rounded-[32px] border border-border bg-card shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden relative"
            >
              {/* Card Header: Facebook style */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Link 
                    to={`/profile/${item.author_profile?.username}`}
                    className="relative shrink-0 group/avatar"
                  >
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-muted border-2 border-border group-hover/avatar:border-primary transition-all">
                      {item.author_profile?.avatar_url ? (
                        <img src={item.author_profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card shadow-sm" />
                  </Link>
                  <div>
                    <Link 
                      to={`/profile/${item.author_profile?.username}`}
                      className="text-base font-black hover:text-primary transition-colors block leading-none"
                    >
                      {item.author_profile?.full_name || item.author_profile?.username || 'Institutional Student'}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">@{item.author_profile?.username || 'student'}</span>
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="text-[10px] font-medium text-muted-foreground italic">
                        {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block scale-75 origin-right">
                    <CreatorBadge role={item.submission_type === 'research_paper' ? 'writer' : 'creator'} />
                  </div>
                  <div className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                    <Globe size={16} />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>
                </div>

                {item.cover_image && (
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-border group-hover:border-primary/20 transition-all">
                    <img src={item.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    <History size={14} />
                    <span>Peer Review</span>
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                    <Activity size={14} />
                    <span>Analytics</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {item.content_url && (
                    <a 
                      href={item.content_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="px-6 py-2.5 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all shadow-lg"
                    >
                      View Source
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentZone;
