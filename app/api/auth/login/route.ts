import { NextRequest } from 'next/server';
import { apiSupabase, badRequest, json, parseBody, respond } from '@/lib/api';
import { loginSchema } from '@/lib/utils/validators';
import { adminDb } from '@/lib/api';

export async function POST(request: NextRequest) {
  const response = json({});
  try {
    const input = loginSchema.parse(await parseBody(request));
    const supabase = apiSupabase(request, response);
    const { data, error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
    if (error || !data.user) return badRequest(error?.message || 'Unable to sign in.', 401);
    const { data: profile } = await adminDb().from('profiles').select('*').eq('id', data.user.id).single();
    if (!profile?.is_active) { await supabase.auth.signOut(); return badRequest('This account is inactive.', 403); }
    return respond(response, { user: { id: data.user.id, email: data.user.email }, profile });
  } catch (error) { return badRequest(error instanceof Error ? error.message : 'Unable to sign in.'); }
}
