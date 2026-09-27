'use client';
import { useEffect,useState } from 'react';
import toast from 'react-hot-toast';
import { Program } from '@/lib/types/database';
import { api } from '@/lib/utils/helpers';
import { Loader } from '@/components/ui/Loader';
import { ProgramCard } from './ProgramCard';
const filters=['all','kids','beginner','intermediate','advanced'];
export function ProgramsList(){const[programs,setPrograms]=useState<Program[]>([]);const[filter,setFilter]=useState('all');const[loading,setLoading]=useState(true);useEffect(()=>{setLoading(true);api<{programs:Program[]}>(`/api/programs?level=${filter}`).then(x=>setPrograms(x.programs)).catch(e=>toast.error(e.message)).finally(()=>setLoading(false));},[filter]);return <div className="container-page section"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-[.14em] text-amber-700">Train with direction</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight">Programs built for progress</h1><p className="mt-3 text-muted">Choose the right group for your age, ability and goals. Pricing and availability are always live.</p></div><div className="mt-8 flex flex-wrap justify-center gap-2">{filters.map(item=><button type="button" key={item} onClick={()=>setFilter(item)} className={`rounded-full px-4 py-2 text-sm font-bold capitalize transition ${filter===item?'bg-brand text-ink':'bg-white text-muted shadow-sm hover:bg-brand-light'}`}>{item}</button>)}</div><div className="mt-9">{loading?<Loader/>:programs.length?<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{programs.map(program=><ProgramCard program={program} key={program.id}/>)}</div>:<div className="rounded-xl bg-white p-12 text-center text-muted shadow-card">No active programs match this filter.</div>}</div></div>}
