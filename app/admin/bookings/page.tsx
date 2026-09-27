'use client';
import { useEffect,useState } from 'react';
import toast from 'react-hot-toast';
import { BookingsTable } from '@/components/admin/BookingsTable';
import { Loader } from '@/components/ui/Loader';
import { api } from '@/lib/utils/helpers';
import { Court } from '@/lib/types/database';
export default function AdminBookingsPage(){const[courts,setCourts]=useState<Court[]|null>(null);useEffect(()=>{api<{courts:Court[]}>('/api/courts?all=1').then(x=>setCourts(x.courts)).catch(e=>toast.error(e.message));},[]);return <div><div className="mb-7"><p className="text-sm font-bold uppercase tracking-[.14em] text-amber-700">Reservations</p><h1 className="mt-1 text-3xl font-extrabold">Bookings</h1></div>{courts?<BookingsTable courts={courts}/>:<Loader/>}</div>}
