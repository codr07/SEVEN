import React, { useEffect, useState } from 'react';
import { PlayCircle, Clock, BookOpen, Star, Loader2, IndianRupee, Search, Filter, Share2 } from 'lucide-react';
import { supabase, withTimeout, filterVisible } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAlert } from '../context/AlertContext';

const Courses = () => {
  const { showAlert } = useAlert();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await withTimeout(
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        10000,
        'Database connection timed out. Please check your network or try again.'
      );
      if (error) throw error;
      setCourses(filterVisible(data));
    } catch (err) {
      console.error('Supabase fetch error:', err);
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
        <div>
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-animate-gradient">Courses</h1>
          <p className="max-w-md text-muted-foreground text-lg uppercase tracking-widest leading-relaxed mt-2">
            Master the future with our industry-driven curriculum and hands-on projects.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-card border border-border rounded-full outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-4 border rounded-full transition-colors shadow-sm ${selectedCategory ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent border-border"}`}
            >
              <Filter size={20} />
            </button>
            
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 text-xs font-black uppercase tracking-widest text-muted-foreground opacity-70 mb-1">Filter by Category</div>
                  <button 
                    onClick={() => { setSelectedCategory(''); setIsFilterOpen(false); }} 
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${!selectedCategory ? "bg-primary/10 text-primary" : "hover:bg-accent"}`}
                  >
                    All Courses
                  </button>
                  {[...new Set(courses.map(c => c.category))].filter(Boolean).map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => { setSelectedCategory(cat); setIsFilterOpen(false); }} 
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${selectedCategory === cat ? "bg-primary/10 text-primary" : "hover:bg-accent"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary w-12 h-12" />
        </div>
      ) : errorMsg ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 text-destructive">
          <div className="text-xl font-bold uppercase tracking-widest">Connection Issue</div>
          <div className="text-sm opacity-80 max-w-xl text-center px-4 mb-4">{errorMsg}</div>
          <button onClick={fetchCourses} className="px-8 py-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
            Retry Connection
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <div className="text-xl font-bold uppercase tracking-widest">No Courses Found</div>
          <div className="text-sm opacity-80">We currently have no courses available. Check back soon!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.filter(course => {
            const matchesSearch = !searchQuery || 
              String(course.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
              String(course.short_desc || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              String(course.category || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || course.category === selectedCategory;
            return matchesSearch && matchesCategory;
          }).map((course) => (
            <Link 
              to={`/courses/${course.id}`} 
              key={course.id} 
              className="group institution-card flex flex-col justify-between"
            >
              <div className="flex-1 flex flex-col relative z-10">
                <div className="w-full h-44 relative rounded-2xl overflow-hidden mb-6 border border-border">
                  <img 
                    src={course.thumbnail || course.image_url || course.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop'} 
                    alt={course.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-3 left-3">
                    <div className="badge-glass px-3 py-1.5 rounded-full text-[10px]">
                      {course.category}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 z-30">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const url = `${window.location.origin}/courses/${course.id}`;
                        navigator.clipboard.writeText(url);
                        showAlert("Link copied to clipboard!", "success");
                      }}
                      className="p-2 bg-black/40 backdrop-blur-md border border-white/20 hover:bg-primary hover:text-white rounded-full transition-all duration-300 shadow-lg text-white"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-black uppercase tracking-widest mb-4 leading-tight min-h-[4rem] text-balance group-hover:text-primary transition-colors duration-300">
                  {course.name}
                </h3>
                <p className="text-sm font-medium text-muted-foreground mb-6 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {course.short_desc}
                </p>
                
                <div className="space-y-3 mb-8 bg-muted/30 p-4 rounded-2xl border border-border">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <Clock size={14} className="text-primary" />
                    <span>{course.duration || 'Flexible'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary">
                    <IndianRupee size={14} />
                    <span>
                      {course.price 
                        ? (['free', '0'].includes(String(course.price).toLowerCase().trim()) 
                            ? 'Free Access' 
                            : `₹${course.price}`) 
                        : 'Free Access'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="cool-button w-full text-center">
                Explore Course
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
