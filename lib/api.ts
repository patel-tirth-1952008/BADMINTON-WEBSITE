import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';

export const json = (data: unknown, init?: ResponseInit) => NextResponse.json(data, init);
export const respond = (cookieResponse: NextResponse, data: unknown, status = 200) => {
  const response = json(data, { status });
  cookieResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
};
export const badRequest = (error: string, status = 400) => json({ error }, { status });
export const parseBody = async (request: NextRequest) => { try { return await request.json(); } catch { throw new Error('Invalid JSON request body.'); } };

export function apiSupabase(request: NextRequest, response: NextResponse) {
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (entries: Array<{ name: string; value: string; options: any }>) => entries.forEach(({ name, value, options }) => response.cookies.set(name, value, options)), 
    },
  });
}

export async function currentUser(request: NextRequest, response = json({})) {
  const supabase = apiSupabase(request, response);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, profile: null, supabase, response };
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return { user, profile, supabase, response };
}

export async function requireUser(request: NextRequest) {
  const response = json({});
  const auth = await currentUser(request, response);
  if (!auth.user || !auth.profile || !auth.profile.is_active) return { ...auth, failure: badRequest('Please sign in to continue.', 401) };
  return { ...auth, failure: null };
}

export async function requireAdmin(request: NextRequest) {
  const auth = await requireUser(request);
  if (auth.failure) return auth;
  if (auth.profile.role !== 'admin') return { ...auth, failure: badRequest('Administrator access is required.', 403) };
  return auth;
}

export const adminDb = () => createAdminClient();
