const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://nencqzpwijcffylutbav.supabase.co';
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5Dv9SpFdxrtcP-IVjVeKsw_FJHQEzlE';

const STORAGE_KEY = 'tyneside_agent_admin_session';

export interface AdminSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  email: string;
  role: string;
}

const authHeaders = () => ({
  apikey: SUPABASE_PUBLISHABLE_KEY,
  'Content-Type': 'application/json',
});

export const getStoredSession = (): AdminSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSession;
    if (!parsed?.access_token || !parsed?.refresh_token || parsed.role !== 'Admin') return null;
    return parsed;
  } catch {
    return null;
  }
};

const storeSession = (session: AdminSession | null) => {
  if (typeof window === 'undefined') return;
  if (!session) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

const normalizeSession = (payload: any): AdminSession => ({
  access_token: payload.access_token,
  refresh_token: payload.refresh_token,
  expires_at: Math.floor(Date.now() / 1000) + Number(payload.expires_in || 3600),
  email: payload.user?.email || '',
  role: payload.user?.app_metadata?.role || '',
});

export const signInAdmin = async (email: string, password: string): Promise<AdminSession> => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email: email.trim(), password }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('Invalid email or password.');

  const session = normalizeSession(payload);
  if (session.role !== 'Admin') {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } catch {
      // The backend remains the authoritative role check even if logout fails.
    }
    throw new Error('This dashboard is restricted to Tyneside administrators.');
  }

  storeSession(session);
  return session;
};

export const signOutAdmin = async (): Promise<void> => {
  const session = getStoredSession();
  storeSession(null);
  if (!session) return;

  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        ...authHeaders(),
        Authorization: `Bearer ${session.access_token}`,
      },
    });
  } catch {
    // Local sign-out is sufficient; the token will expire server-side.
  }
};

const refreshAdminSession = async (session: AdminSession): Promise<AdminSession> => {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    storeSession(null);
    throw new Error('Your admin session has expired. Please sign in again.');
  }

  const refreshed = normalizeSession(payload);
  if (refreshed.role !== 'Admin') {
    storeSession(null);
    throw new Error('This account no longer has administrator access.');
  }

  storeSession(refreshed);
  return refreshed;
};

export const getValidAdminSession = async (): Promise<AdminSession> => {
  let session = getStoredSession();
  if (!session) throw new Error('Please sign in as an administrator.');

  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at <= now + 60) {
    session = await refreshAdminSession(session);
  }
  return session;
};

export const apiFetch = async (
  input: string,
  init: RequestInit = {}
): Promise<Response> => {
  const session = await getValidAdminSession();
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${session.access_token}`);

  const response = await fetch(input, { ...init, headers });
  if (response.status === 401 || response.status === 403) {
    storeSession(null);
  }
  return response;
};
