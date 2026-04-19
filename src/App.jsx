import React, { useState, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { ThemeProvider } from './context/ThemeContext';
import CustomCursor from './components/CustomCursor';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Academics from './pages/Academics';
import Courses from './pages/Courses';
import Notes from './pages/Notes';
import Services from './pages/Services';
import Stars from './pages/Stars';
import Contact from './pages/Contact';
import StudentZone from './pages/StudentZone';
import CourseDetail from './pages/details/CourseDetail';
import ServiceDetail from './pages/details/ServiceDetail';
import NoteDetail from './pages/details/NoteDetail';
import AcademicsDetail from './pages/details/AcademicsDetail';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import SevenMod from './pages/SevenMod';

const AppContent = ({ loading, setLoading }) => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/seven-mod';

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // If Lenis is active, force it to reset to top immediately to prevent scrolling physics from offsetting the top
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }
  }, [location.pathname]);

  return (
    <>
      {loading && <LoadingScreen onLoadingComplete={() => setLoading(false)} />}
      <CustomCursor />
      {!loading && (
        <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col md:flex-row">
          {!isAdminPage && <Navbar />}
          <div className="flex-1 flex flex-col w-full min-w-0">
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/academics" element={<Academics />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/services" element={<Services />} />
                <Route path="/stars" element={<Stars />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/student-zone" element={<StudentZone />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/notes/:id" element={<NoteDetail />} />
                <Route path="/academics/:id" element={<AcademicsDetail />} />
                <Route path="/seven-mod" element={<SevenMod />} />
              </Routes>
            </main>
            {!isAdminPage && <Footer />}
          </div>
        </div>
      )}
    </>
  );
};

import { useMagneticHover } from './hooks/useMagneticHover';

const App = () => {
  const [loading, setLoading] = useState(false);

  useMagneticHover();

  useLayoutEffect(() => {
    console.log('App: Initializing smooth scroll (Lenis)');
    try {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      window.lenis = lenis;

      console.log('App: Lenis initialized successfully');

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
        delete window.lenis;
        console.log('App: Lenis destroyed');
      };
    } catch (err) {
      console.error('App: Failed to initialize Lenis:', err);
    }
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppContent loading={loading} setLoading={setLoading} />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
