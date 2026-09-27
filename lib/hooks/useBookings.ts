'use client';
import { useCallback, useEffect, useState } from 'react';
import type { TimeSlot } from '@/lib/types/database';
import { api } from '@/lib/utils/helpers';
export function useAvailability(date:string,courtId?:string){const[slots,setSlots]=useState<TimeSlot[]>([]);const[bookedSlotIds,setBooked]=useState<string[]>([]);const[loading,setLoading]=useState(false);const refresh=useCallback(async()=>{if(!date||!courtId){setSlots([]);setBooked([]);return;}setLoading(true);try{const data=await api<{slots:TimeSlot[];bookedSlotIds:string[]}>(`/api/bookings/availability?date=${date}&courtId=${courtId}`);setSlots(data.slots);setBooked(data.bookedSlotIds);}finally{setLoading(false);}},[date,courtId]);useEffect(()=>{refresh().catch(()=>{setSlots([]);setBooked([]);setLoading(false);});},[refresh]);return{slots,bookedSlotIds,loading,refresh};}
