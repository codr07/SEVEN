import React, { useState, useLayoutEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import PublicProfile from './pages/PublicProfile';
import OAuthConsent from './pages/OAuthConsent';
import DeveloperDocs from './pages/DeveloperDocs';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';

const SevenMod = lazy(() => import('./pages/SevenMod'));

const AppContent = ({ loading, setLoading }) => {
  const { loading: authLoading } = useAuth();
  const location = useLocation();
  const isAdminPage = location.pathname === '/seven-mod';

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }

    // Update document title based on the route
    const titles = {
      '/': 'Home',
      '/academics': 'Academics',
      '/courses': 'Courses',
      '/notes': 'Notes',
      '/services': 'Services',
      '/stars': 'Stars',
      '/contact': 'Contact',
      '/student-zone': 'Student Zone',
      '/seven-mod': 'Admin Panel',
      '/oauth/consent': 'Authorization Request',
      '/developers': 'Developer API',
    };
    const baseRoute = '/' + location.pathname.split('/')[1];
    let pageName = titles[location.pathname] || titles[baseRoute] || '';
    if (baseRoute === '/profile') pageName = 'Profile';
    
    document.title = pageName || '5EVEN Institution';
  }, [location.pathname]);

  const isAppLoading = loading || authLoading;

  return (
    <>
      {isAppLoading && <LoadingScreen onLoadingComplete={() => setLoading(false)} />}
      <CustomCursor />
      {!isAppLoading && (
        <div className="min-h-screen bg-background transition-colors duration-300 flex flex-col md:flex-row">
          {!isAdminPage && <Navbar />}
          <div className="flex-1 flex flex-col w-full min-w-0">
            <main className="flex-1">
              <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
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
                  <Route path="/profile" element={<Navigate to="/student-zone?tab=settings" replace />} />
                  <Route path="/profile/:username" element={<PublicProfile />} />
                  <Route path="/oauth/consent" element={<OAuthConsent />} />
                  <Route path="/developers" element={<DeveloperDocs />} />
                  <Route path="/seven-mod" element={<SevenMod />} />
                </Routes>
              </Suspense>
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
