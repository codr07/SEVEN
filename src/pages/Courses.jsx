import React, { useEffect, useState } from 'react';
import { PlayCircle, Clock, BookOpen, Star, Loader2, IndianRupee } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from('courses').select('*');
      if (error) console.error(error);
      else setCourses(data || []);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter">Courses</h1>
        <p className="max-w-md text-muted-foreground text-lg uppercase tracking-widest leading-relaxed">
          Master the future with our industry-driven curriculum and hands-on projects.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary w-12 h-12" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="group relative overflow-hidden glass rounded-3xl p-8 hover-glow border border-primary/10">
              <div className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">
                {course.category}
              </div>
              <h3 className="text-xl font-bold uppercase tracking-widest mb-4 leading-tight min-h-[4rem] text-balance">
                {course.name}
              </h3>
              <p className="text-sm opacity-70 mb-6 line-clamp-2 min-h-[2.5rem]">
                {course.short_desc}
              </p>
              
              <div className="space-y-4 mb-8 opacity-70 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock size={16} /> <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <IndianRupee size={16} /> <span>{course.price}</span>
                </div>
                {course.extra_details?.certification_available && (
                  <div className="flex items-center gap-2 text-sm font-medium text-yellow-500">
                    <Star size={16} fill="currentColor" /> <span>Certification Available</span>
                  </div>
                )}
              </div>

              <Link to={`/courses/${course.id}`} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl">
                <PlayCircle size={20} />
                <span>View Details</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
