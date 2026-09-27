import { NextRequest } from 'next/server';
import { currentUser, json, respond } from '@/lib/api';
export async function GET(request: NextRequest) {
  try { const { user, profile, response } = await currentUser(request); if (!user || !profile) return json({ user: null, profile: null }, { status: 401 }); return respond(response, { user: { id: user.id, email: user.email }, profile }); }
  catch (error) { return json({ error: error instanceof Error ? error.message : 'Unable to load session.' }, { status: 500 }); }
}
