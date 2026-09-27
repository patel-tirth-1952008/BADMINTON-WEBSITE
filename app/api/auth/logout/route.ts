import { NextRequest } from 'next/server';
import { apiSupabase, json, respond } from '@/lib/api';

export async function POST(request: NextRequest) {
  const response = json({});
  try { const { error } = await apiSupabase(request, response).auth.signOut(); if (error) throw error; return respond(response, { success: true }); }
  catch (error) { return json({ error: error instanceof Error ? error.message : 'Unable to sign out.' }, { status: 400 }); }
}
