import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, orderedFetch, filterVisible, withTimeout } from '../lib/supabase';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
  const [academics, setAcademics] = useState([]);
  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [services, setServices] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [founders, setFounders] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
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

      setAcademics(filterVisible(aca.data || []));
      setCourses(filterVisible(crs.data || []));
      
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
      setNotes(filterVisible(notesWithPrice));
      
      setServices(filterVisible(srv.data || []));
      setFaculty(filterVisible(fac.data || []));
      setFounders(filterVisible(fnd.data || []));
      setUpdates(upd.data || []);

      setLoading(false);
    } catch (err) {
      console.error('Global Data Fetch Error:', err);
      
      // Automatic retry logic (up to 2 times) for seamless recovery
      if (retryCount < 2) {
        console.log(`Retrying global fetch... (Attempt ${retryCount + 1})`);
        setTimeout(() => fetchAllData(retryCount + 1), 2000);
      } else {
        setError(err.message || 'Failed to sync with institutional database.');
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
