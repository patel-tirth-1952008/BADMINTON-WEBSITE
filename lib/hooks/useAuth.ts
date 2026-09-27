'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/utils/helpers';
import type { Profile } from '@/lib/types/database';
export function useAuth(){const[user,setUser]=useState<{id:string;email?:string}|null>(null);const[profile,setProfile]=useState<Profile|null>(null);const[loading,setLoading]=useState(true);const refresh=useCallback(async()=>{try{const data=await api<{user:{id:string;email?:string};profile:Profile}>('/api/auth/me');setUser(data.user);setProfile(data.profile);}catch{setUser(null);setProfile(null);}finally{setLoading(false);}},[]);useEffect(()=>{refresh();},[refresh]);return{user,profile,loading,refresh};}
