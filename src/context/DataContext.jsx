import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, orderedFetch, filterVisible, withTimeout } from '../lib/supabase';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [academics, setAcademics] = useState(() => {
    try {
      const cached = localStorage.getItem('seven_cached_academics');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [courses, setCourses] = useState(() => {
    try {
      const cached = localStorage.getItem('seven_cached_courses');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [notes, setNotes] = useState(() => {
    try {
      const cached = localStorage.getItem('seven_cached_notes');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [services, setServices] = useState(() => {
    try {
      const cached = localStorage.getItem('seven_cached_services');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [faculty, setFaculty] = useState(() => {
    try {
      const cached = localStorage.getItem('seven_cached_faculty');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [founders, setFounders] = useState(() => {
    try {
      const cached = localStorage.getItem('seven_cached_founders');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [updates, setUpdates] = useState(() => {
    try {
      const cached = localStorage.getItem('seven_cached_updates');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const timestamp = localStorage.getItem('seven_cache_timestamp');
      return !timestamp; // If cached, don't show initial loading screen
    } catch { return true; }
  });
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async (retryCount = 0) => {
    try {
      const hasCache = localStorage.getItem('seven_cache_timestamp');
      if (!hasCache) {
        setLoading(true);
      }
      setError(null);

      // Perform all fetches in parallel with a timeout
      const results = await withTimeout(
        Promise.all([
          orderedFetch(supabase, 'academics'),
          orderedFetch(supabase, 'courses'),
          orderedFetch(supabase, 'notes'),
          orderedFetch(supabase, 'services'),
          orderedFetch(supabase, 'faculty'),
          orderedFetch(supabase, 'founders'),
          orderedFetch(supabase, 'updates')
        ]),
        15000,
        'Global data fetch timed out.'
      );

      const [aca, crs, nts, srv, fac, fnd, upd] = results;

      // Handle potential errors in individual results if needed, 
      // but orderedFetch returns {data, error}
      if (aca.error || crs.error || nts.error || srv.error || fac.error || fnd.error || upd.error) {
         const firstError = aca.error || crs.error || nts.error || srv.error || fac.error || fnd.error || upd.error;
         throw firstError;
      }

      const filteredAca = filterVisible(aca.data || []);
      const filteredCrs = filterVisible(crs.data || []);
      
      const notesWithPrice = (nts.data || []).map(n => {
        let priceVal = null;
        if (n.extra_details) {
          let details = n.extra_details;
          if (typeof details === 'string') {
            try { details = JSON.parse(details); } catch {}
          }
          priceVal = details?.price;
        }
        return {
          ...n,
          price: priceVal || null
        };
      });
      const filteredNts = filterVisible(notesWithPrice);
      
      const filteredSrv = filterVisible(srv.data || []);
      const filteredFac = filterVisible(fac.data || []);
      const filteredFnd = filterVisible(fnd.data || []);
      const filteredUpd = upd.data || [];

      setAcademics(filteredAca);
      setCourses(filteredCrs);
      setNotes(filteredNts);
      setServices(filteredSrv);
      setFaculty(filteredFac);
      setFounders(filteredFnd);
      setUpdates(filteredUpd);

      // Persist values in cache for instant future loads
      try {
        localStorage.setItem('seven_cached_academics', JSON.stringify(filteredAca));
        localStorage.setItem('seven_cached_courses', JSON.stringify(filteredCrs));
        localStorage.setItem('seven_cached_notes', JSON.stringify(filteredNts));
        localStorage.setItem('seven_cached_services', JSON.stringify(filteredSrv));
        localStorage.setItem('seven_cached_faculty', JSON.stringify(filteredFac));
        localStorage.setItem('seven_cached_founders', JSON.stringify(filteredFnd));
        localStorage.setItem('seven_cached_updates', JSON.stringify(filteredUpd));
        localStorage.setItem('seven_cache_timestamp', Date.now().toString());
      } catch (cacheErr) {
        console.warn('Failed to write to cache:', cacheErr);
      }

      setLoading(false);
    } catch (err) {
      console.error('Global Data Fetch Error:', err);
      
      // Automatic retry logic (up to 2 times) for seamless recovery
      if (retryCount < 2) {
        console.log(`Retrying global fetch... (Attempt ${retryCount + 1})`);
        setTimeout(() => fetchAllData(retryCount + 1), 2000);
      } else {
        const hasCache = localStorage.getItem('seven_cache_timestamp');
        if (hasCache) {
          console.warn('Circuit breaker active: Sync with database failed. Falling back to local cache.');
          setError(null); // Clear error, allow app to function with cache
        } else {
          setError(err.message || 'Failed to sync with institutional database.');
        }
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return (
    <DataContext.Provider value={{ 
      academics, courses, notes, services, faculty, founders, updates, 
      loading, error, refresh: fetchAllData 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
