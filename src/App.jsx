import React, { useState, useLayoutEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Lenis from 'lenis';
import { ThemeProvider } from './context/ThemeContext';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
const Home = lazy(() => import('./pages/Home'));
const Academics = lazy(() => import('./pages/Academics'));
const Courses = lazy(() => import('./pages/Courses'));
const Notes = lazy(() => import('./pages/Notes'));
const Services = lazy(() => import('./pages/Services'));
const Stars = lazy(() => import('./pages/Stars'));
const Contact = lazy(() => import('./pages/Contact'));
const StudentZone = lazy(() => import('./pages/StudentZone'));
const CourseDetail = lazy(() => import('./pages/details/CourseDetail'));
const ServiceDetail = lazy(() => import('./pages/details/ServiceDetail'));
const NoteDetail = lazy(() => import('./pages/details/NoteDetail'));
const AcademicsDetail = lazy(() => import('./pages/details/AcademicsDetail'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const OAuthConsent = lazy(() => import('./pages/OAuthConsent'));
const DeveloperDocs = lazy(() => import('./pages/DeveloperDocs'));
const SevenMod = lazy(() => import('./pages/SevenMod'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const UpdateDetail = lazy(() => import('./pages/UpdateDetail'));
const PaymentGateway = lazy(() => import('./pages/PaymentGateway'));
const ContiCMS = lazy(() => import('./pages/ContiCMS'));
const CourseViewer = lazy(() => import('./pages/CourseViewer'));
const NoteViewer = lazy(() => import('./pages/NoteViewer'));

import Footer from './components/Footer';
import FloatingUpdates from './components/FloatingUpdates';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { AlertProvider } from './context/AlertContext';
import GlobalBackground from './components/GlobalBackground';

const AdminRoute = ({ children }) => {
  const { role, loading } = useAuth();
  if (loading) return null;
  if (role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const FacultyAdminRoute = ({ children }) => {
  const { role, loading } = useAuth();
  if (loading) return null;
  if (role !== 'admin' && role !== 'faculty') return <Navigate to="/" replace />;
  return children;
};

const AppContent = ({ loading, setLoading }) => {
  const { loading: authLoading } = useAuth();
  const { loading: dataLoading } = useData();
  const location = useLocation();
  const isAdminPage = location.pathname === '/seven-mod' || location.pathname === '/conti';

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }

    const PAGE_METADATA = {
      '/': {
        title: 'Home',
        description: '5EVEN Institution - A premium institutional experience. Redefining education with divine balance and innovation.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      },
      '/academics': {
        title: 'Institutional Tracks',
        description: 'Explore elite academic curricula and structured learning pathways at 5EVEN Institution.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      },
      '/courses': {
        title: 'Mastery Programs',
        description: 'Advanced professional courses and skill development programs designed for the next generation.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      },
      '/notes': {
        title: 'Study Desk',
        description: 'High-fidelity study materials and institutional notes to accelerate your mastery.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      },
      '/services': {
        title: 'Professional Services',
        description: 'Premium digital solutions, commercial support, and specialized IT services by 5EVEN.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      },
      '/stars': {
        title: 'Our Stars',
        description: 'Celebrating the excellence and achievements of our most distinguished visionaries.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      },
      '/contact': {
        title: 'Get in Touch',
        description: 'Connect with the 5EVEN Institution team for inquiries, support, or collaboration.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      },
      '/student-zone': {
        title: 'Student Zone',
        description: 'Your personalized institutional dashboard. Access certificates, settings, and profile management.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      },
      '/seven-mod': {
        title: 'Admin Control',
        description: 'Authorized personnel access to 5EVEN institutional management systems.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      },
      '/developers': {
        title: 'Developer Portal',
        description: 'Build with 5EVEN. Documentation and API resources for institutional developers.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      },
      '/payment': {
        title: 'Payment Gateway',
        description: 'Secure payment gateway for 5EVEN Institution powered by Slice Bank.',
        image: 'https://5even.netlify.app/assets/images/img/banner.png'
      }
    };

    const baseRoute = '/' + location.pathname.split('/')[1];
    const meta = PAGE_METADATA[location.pathname] || PAGE_METADATA[baseRoute] || PAGE_METADATA['/'];
    
    const fullTitle = `${meta.title} | 5EVEN Institution`;
    document.title = fullTitle;

    // Update Meta Tags
    const updateMeta = (selector, attr, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.startsWith('meta[')) {
          const name = selector.split('"')[1];
          el.setAttribute(attr, name);
        } else if (selector.startsWith('meta[property')) {
          const prop = selector.split('"')[1];
          el.setAttribute('property', prop);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard Tags
    updateMeta('meta[name="description"]', 'name', meta.description);

    // Open Graph Tags
    updateMeta('meta[property="og:title"]', 'property', fullTitle);
    updateMeta('meta[property="og:description"]', 'property', meta.description);
    updateMeta('meta[property="og:image"]', 'property', meta.image);
    updateMeta('meta[property="og:url"]', 'property', window.location.href);

    // Twitter Tags
    updateMeta('meta[name="twitter:title"]', 'name', fullTitle);
    updateMeta('meta[name="twitter:description"]', 'name', meta.description);
    updateMeta('meta[name="twitter:image"]', 'name', meta.image);

  }, [location.pathname]);

  const isAppLoading = loading || authLoading || dataLoading;

  return (
    <>
      <GlobalBackground />
      {isAppLoading && <LoadingScreen onLoadingComplete={() => setLoading(false)} />}
      {!isAppLoading && (
        <div className="min-h-screen transition-colors duration-300 flex flex-col md:flex-row">
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
                  <Route path="/developers" element={
                    <AdminRoute>
                      <DeveloperDocs />
                    </AdminRoute>
                  } />
                  <Route path="/conti" element={
                    <FacultyAdminRoute>
                      <ContiCMS />
                    </FacultyAdminRoute>
                  } />
                  <Route path="/learn/course/:id" element={<CourseViewer />} />
                  <Route path="/learn/note/:id" element={<NoteViewer />} />
                  <Route path="/seven-mod" element={
                    <AdminRoute>
                      <SevenMod />
                    </AdminRoute>
                  } />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/updates/:slug" element={<UpdateDetail />} />
                  <Route path="/payment" element={<PaymentGateway />} />
                </Routes>
              </Suspense>
            </main>
            {!isAdminPage && <Footer />}
            {!isAdminPage && <FloatingUpdates />}
          </div>
        </div>
      )}
    </>
  );
};

const App = () => {
  const [loading, setLoading] = useState(false);

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
    <AlertProvider>
      <AuthProvider>
        <DataProvider>
          <ThemeProvider>
            <Router>
              <AppContent loading={loading} setLoading={setLoading} />
            </Router>
          </ThemeProvider>
        </DataProvider>
      </AuthProvider>
    </AlertProvider>
  );
};

export default App;
