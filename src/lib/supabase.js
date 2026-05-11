import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'seven-auth-v3-stable',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: (name, acquireTimeout, fn) => {
      // Bypass Web Locks API to prevent phantom locks from halting initialization for 5000ms
      return fn();
    }
  }
});

export default supabase;

export const withTimeout = (queryOrPromise, ms = 10000, timeoutError = 'Request timed out') => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutError));
    }, ms);

    Promise.resolve(queryOrPromise)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

export const filterVisible = (items = []) => {
  if (!items) return [];
  return items.filter(item => {
    let details = {};
    if (typeof item.extra_details === 'string') {
      try { details = JSON.parse(item.extra_details); } catch {}
    } else if (item.extra_details) {
      details = item.extra_details;
    }
    return details?.is_visible !== false;
  });
};

export const orderedFetch = async (
  supabaseClient, 
  tableName, 
  selectClause = '*', 
  orderConfigs = [
    { column: 'order_index', options: { ascending: true, nullsFirst: false } }, 
    { column: 'created_at', options: { ascending: false } }
  ]
) => {
  let query = supabaseClient.from(tableName).select(selectClause);
  
  // Try to apply orders
  orderConfigs.forEach(conf => {
    query = query.order(conf.column, conf.options);
  });

  const { data, error } = await query;

  // Even if there is no error, we perform a safety sort in the frontend 
  // because the DB might sort order_index as text (1, 10, 2) instead of numbers (1, 2, 10).
  if (data) {
    const safetySorted = [...data].sort((a, b) => {
      const getOrder = (val) => {
        if (val === null || val === undefined || val === '') return Infinity;
        const n = Number(val);
        return isNaN(n) ? Infinity : n;
      };

      const aOrder = getOrder(a.order_index);
      const bOrder = getOrder(b.order_index);
      
      if (aOrder !== bOrder) return aOrder - bOrder;

      const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
    return { data: safetySorted, error: null };
  }

  // If error is "column does not exist" (42703), fall back to a simple fetch and sort manually
  if (error && error.code === '42703') {
    const fallback = await supabaseClient.from(tableName).select(selectClause);
    if (fallback.error) return fallback;

    const sorted = [...(fallback.data || [])].sort((a, b) => {
      const getOrder = (val) => {
        if (val === null || val === undefined || val === '') return Infinity;
        const n = Number(val);
        return isNaN(n) ? Infinity : n;
      };

      const aOrder = getOrder(a.order_index);
      const bOrder = getOrder(b.order_index);
      
      if (aOrder !== bOrder) return aOrder - bOrder;

      const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
    return { data: sorted, error: null };
  }

  return { data, error };
};
