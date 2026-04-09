import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import supabase from '../lib/supabase';

const INITIAL_SIGNUP = {
  username: '',
  fullName: '',
  phone: '',
  avatarUrl: '',
  linkedin: '',
  github: '',
  linktree: '',
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
  const { user, login, signup, logout, role, profile, refreshProfile, loading: authLoading, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupData, setSignupData] = useState(INITIAL_SIGNUP);

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isBusy, setIsBusy] = useState(false);

  const [editableProfile, setEditableProfile] = useState(null);
  const [publicPosts, setPublicPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [postForm, setPostForm] = useState(INITIAL_POST);
  const [loadingData, setLoadingData] = useState(true);

  const isStudent = role === 'student';

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (!requestedTab) return;

    if (requestedTab === 'dashboard' || requestedTab === 'settings' || requestedTab === 'publish') {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    setEditableProfile(profile || null);
  }, [profile]);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        await Promise.all([fetchPublicPosts(), user ? fetchMyPosts() : Promise.resolve()]);
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

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    setMessage({ text: '', type: '' });

    try {
      if (authMode === 'login') {
        await login(email, password);
        setMessage({ text: 'Logged in successfully.', type: 'success' });
      } else {
        if (!signupData.username || !signupData.fullName || !signupData.phone) {
          throw new Error('Username, full name, and phone number are required for signup.');
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
        social_links: editableProfile.social_links || { linkedin: '', github: '', linktree: '' },
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

  const submitPost = async (e) => {
    e.preventDefault();
    if (!user?.id || !isStudent) return;

    setIsBusy(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        author_id: user.id,
        title: postForm.title,
        submission_type: postForm.submission_type,
        summary: postForm.summary,
        content_url: postForm.content_url || null,
        cover_image: postForm.cover_image || null,
        moderation_status: 'on_hold',
        is_pushed: false,
      };

      const { error } = await supabase.from('student_submissions').insert([payload]);
      if (error) throw error;

      setPostForm(INITIAL_POST);
      await Promise.all([fetchMyPosts(), fetchPublicPosts()]);
      setMessage({ text: 'Submission added and sent for admin review (on hold).', type: 'success' });
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

  const stats = useMemo(() => {
    const pushed = myPosts.filter((p) => p.is_pushed).length;
    const onHold = myPosts.filter((p) => !p.is_pushed).length;
    return {
      total: myPosts.length,
      pushed,
      onHold,
    };
  }, [myPosts]);

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
            className="w-full p-8 md:p-10 rounded-4xl bg-card border border-border shadow-2xl"
          >
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Student Zone</h2>
            <p className="text-sm text-muted-foreground">
              Login and account controls are handled from the top-right navbar avatar menu. Student Zone shows published work here.
            </p>
          </motion.div>
          <PublicFeed loadingData={loadingData} posts={publicPosts} />
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
          <aside className="space-y-4">
            <nav className="flex flex-col gap-2">
              <TabButton icon={LayoutDashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>
                Dashboard
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
                  {role === 'admin' && (
                    <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-semibold">
                      Admin account detected. Use /seven-mod for admin controls. Student publishing is intended for student role accounts.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="My Submissions" value={String(stats.total)} />
                    <StatCard title="Pushed" value={String(stats.pushed)} />
                    <StatCard title="On Hold" value={String(stats.onHold)} />
                  </div>

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

                  <PublicFeed loadingData={loadingData} posts={publicPosts} />
                </motion.div>
              )}

              {activeTab === 'settings' && editableProfile && (
                <motion.div key="settings" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
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
                      <Field label="Email (read-only)">
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground"
                        />
                      </Field>
                      <Field label="Avatar URL">
                        <input
                          type="text"
                          value={editableProfile.avatar_url || ''}
                          onChange={(e) => setEditableProfile((p) => ({ ...p, avatar_url: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        />
                      </Field>
                      <Field label="Cover URL">
                        <input
                          type="text"
                          value={editableProfile.cover_url || ''}
                          onChange={(e) => setEditableProfile((p) => ({ ...p, cover_url: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Field label="LinkedIn">
                        <div className="relative">
                          <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={editableProfile.social_links?.linkedin || ''}
                            onChange={(e) =>
                              setEditableProfile((p) => ({
                                ...p,
                                social_links: { ...(p.social_links || {}), linkedin: e.target.value },
                              }))
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                          />
                        </div>
                      </Field>
                      <Field label="GitHub">
                        <div className="relative">
                          <FolderGit2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={editableProfile.social_links?.github || ''}
                            onChange={(e) =>
                              setEditableProfile((p) => ({
                                ...p,
                                social_links: { ...(p.social_links || {}), github: e.target.value },
                              }))
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                          />
                        </div>
                      </Field>
                      <Field label="Linktree">
                        <div className="relative">
                          <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            value={editableProfile.social_links?.linktree || ''}
                            onChange={(e) =>
                              setEditableProfile((p) => ({
                                ...p,
                                social_links: { ...(p.social_links || {}), linktree: e.target.value },
                              }))
                            }
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                          />
                        </div>
                      </Field>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isBusy}
                        className="px-6 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center gap-2"
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
                    </div>

                    {message.text && <MessageBox type={message.type}>{message.text}</MessageBox>}
                  </form>
                </motion.div>
              )}

              {activeTab === 'publish' && isStudent && (
                <motion.div key="publish" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <form onSubmit={submitPost} className="space-y-4 p-6 rounded-3xl border border-border bg-card shadow-xl">
                    <h3 className="text-xl font-black">Publish Project / Research Paper</h3>
                    <p className="text-sm text-muted-foreground">All submissions are on hold until admin pushes them globally.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Title" required>
                        <input
                          type="text"
                          required
                          value={postForm.title}
                          onChange={(e) => setPostForm((p) => ({ ...p, title: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        />
                      </Field>
                      <Field label="Type" required>
                        <select
                          value={postForm.submission_type}
                          onChange={(e) => setPostForm((p) => ({ ...p, submission_type: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        >
                          <option value="project">Project</option>
                          <option value="research_paper">Research Paper</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Summary" required>
                      <textarea
                        required
                        value={postForm.summary}
                        onChange={(e) => setPostForm((p) => ({ ...p, summary: e.target.value }))}
                        className="w-full min-h-[120px] px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                      />
                    </Field>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Content URL">
                        <input
                          type="text"
                          value={postForm.content_url}
                          onChange={(e) => setPostForm((p) => ({ ...p, content_url: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                          placeholder="https://paper-or-project-link"
                        />
                      </Field>
                      <Field label="Cover Image URL">
                        <input
                          type="text"
                          value={postForm.cover_image}
                          onChange={(e) => setPostForm((p) => ({ ...p, cover_image: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
                        />
                      </Field>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="px-6 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center gap-2"
                    >
                      {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Submit For Review
                    </button>

                    {message.text && <MessageBox type={message.type}>{message.text}</MessageBox>}
                  </form>
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
    className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
      active ? 'bg-primary text-white' : 'hover:bg-card text-muted-foreground border border-border'
    }`}
  >
    <Icon size={16} />
    {children}
  </button>
);

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

const StatCard = ({ title, value }) => (
  <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</p>
    <p className="text-3xl font-black mt-1">{value}</p>
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

const PublicFeed = ({ loadingData, posts }) => (
  <div className="p-6 rounded-3xl border border-border bg-card shadow-xl space-y-4">
    <div className="flex items-center gap-3">
      <FileText className="text-primary" size={20} />
      <h3 className="text-xl font-black">Global Student Zone Feed</h3>
    </div>
    {loadingData ? (
      <div className="py-10 flex justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    ) : posts.length === 0 ? (
      <p className="text-sm text-muted-foreground">No pushed submissions yet.</p>
    ) : (
      <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
        {posts.map((item) => (
          <article key={item.id} className="p-4 rounded-2xl border border-border bg-background">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-lg leading-tight">{item.title}</p>
                <p className="text-xs uppercase tracking-widest font-black text-muted-foreground mt-1">{item.submission_type}</p>
              </div>
              <StatusBadge pushed={item.is_pushed} status={item.moderation_status} />
            </div>
            <p className="text-sm text-muted-foreground mt-3">{item.summary}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-muted-foreground">
                By {item.author_profile?.full_name || item.author_profile?.username || 'Student'}
              </p>
              {item.content_url && (
                <a href={item.content_url} target="_blank" rel="noreferrer" className="text-xs font-black uppercase tracking-widest text-primary hover:underline">
                  Open
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
);

export default StudentZone;
