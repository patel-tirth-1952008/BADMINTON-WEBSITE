import { NextRequest } from 'next/server';
import { apiSupabase, adminDb, badRequest, json, parseBody, respond } from '@/lib/api';
import { registerSchema } from '@/lib/utils/validators';

export async function POST(request: NextRequest) {
  const response = json({});
  try {
    const input = registerSchema.parse(await parseBody(request));
    const admin = adminDb();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: input.email, password: input.password, email_confirm: true,
      user_metadata: { full_name: input.full_name },
    });
    if (createError || !created.user) return badRequest(createError?.message || 'Unable to create account.');
    const { error: profileError } = await admin.from('profiles').insert({
      id: created.user.id, full_name: input.full_name, email: input.email, phone: input.phone,
      dob: input.dob || null, gender: input.gender || null, role: 'student',
    });
    if (profileError) { await admin.auth.admin.deleteUser(created.user.id); return badRequest(profileError.message); }
    const supabase = apiSupabase(request, response);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password });
    if (loginError) return badRequest('Account created. Please sign in with your new password.', 201);
    const { password: _password, confirmPassword: _confirm, ...profile } = input;
    return respond(response, { user: { id: created.user.id, email: input.email }, profile: { id: created.user.id, ...profile, role: 'student' } }, 201);
  } catch (error) { return badRequest(error instanceof Error ? error.message : 'Unable to register.'); }
}
