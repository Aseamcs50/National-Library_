import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const RoleContext = createContext();

let editorsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const fetchWithTimeout = (url, options, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
};

const getStorageKey = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const projectId = supabaseUrl.split('//')[1].split('.')[0];
  return `sb-${projectId}-auth-token`;
};

const getUserFromStorage = () => {
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session.access_token || !session.user) return null;
    return session.user;
  } catch {
    return null;
  }
};

const getAccessToken = () => {
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session.access_token || null;
  } catch {
    return null;
  }
};

const fetchAllEditors = async (accessToken) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const url = `${supabaseUrl}/rest/v1/editors?select=email,is_admin`;
  const response = await fetchWithTimeout(url, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

export function RoleProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    userId: null,
    isEditor: false,
    isAdmin: false,
    loading: true,
  });

  const loadRoles = async () => {
    // 1. Get user from localStorage (instant, no network)
    let user = getUserFromStorage();
    if (!user) {
      // Fallback to Supabase client (rare)
      const { data: { user: sbUser }, error } = await supabase.auth.getUser();
      if (error || !sbUser) {
        setState({ user: null, userId: null, isEditor: false, isAdmin: false, loading: false });
        return;
      }
      user = sbUser;
    }

    // 2. Get access token
    let accessToken = getAccessToken();
    if (!accessToken) {
      const { data: { session } } = await supabase.auth.getSession();
      accessToken = session?.access_token;
    }
    if (!accessToken) {
      setState({ user, userId: user.id, isEditor: false, isAdmin: false, loading: false });
      return;
    }

    // 3. Fetch editors list (cached)
    let editors = editorsCache;
    const now = Date.now();
    if (!editors || now - lastFetchTime > CACHE_DURATION) {
      try {
        editors = await fetchAllEditors(accessToken);
        editorsCache = editors;
        lastFetchTime = now;
      } catch (err) {
        console.error('Failed to fetch editors:', err);
        editors = [];
      }
    }

    const editor = editors.find(e => e.email.toLowerCase() === user.email.toLowerCase());
    const isEditor = !!editor;
    const isAdmin = editor?.is_admin === true;

    setState({
      user,
      userId: user.id,
      isEditor,
      isAdmin,
      loading: false,
    });
  };

  const refreshRoles = async () => {
    editorsCache = null;
    await loadRoles();
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (mounted) await loadRoles();
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        editorsCache = null;
        await loadRoles();
      } else if (event === 'SIGNED_OUT') {
        editorsCache = null;
        setState({ user: null, userId: null, isEditor: false, isAdmin: false, loading: false });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <RoleContext.Provider value={{ ...state, refreshRoles }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoles() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRoles must be used within a RoleProvider');
  return context;
}