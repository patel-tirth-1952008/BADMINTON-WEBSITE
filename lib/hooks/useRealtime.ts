'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
export function useBookingRealtime(date:string,onChange:()=>void){useEffect(()=>{if(!date||!process.env.NEXT_PUBLIC_SUPABASE_URL)return;const supabase=createClient();const channel=supabase.channel('court-availability').on('postgres_changes',{event:'*',schema:'public',table:'bookings',filter:`booking_date=eq.${date}`},()=>onChange()).subscribe();return()=>{supabase.removeChannel(channel);};},[date,onChange]);}
