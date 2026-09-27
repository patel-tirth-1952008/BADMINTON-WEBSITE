'use client';
import { useEffect,useState } from 'react';
import toast from 'react-hot-toast';
import { SiteShell } from '@/components/layout/SiteShell';
import { Loader } from '@/components/ui/Loader';
import { ProgressDashboard } from '@/components/progress/ProgressDashboard';
import { api } from '@/lib/utils/helpers';
import { AttendanceEntry, ProgressEntry } from '@/lib/types/database';
export default function ProgressPage(){const[progress,setProgress]=useState<ProgressEntry[]|null>(null);const[attendance,setAttendance]=useState<AttendanceEntry[]>([]);useEffect(()=>{api<{progress:ProgressEntry[];attendance:AttendanceEntry[]}>('/api/progress').then(x=>{setProgress(x.progress);setAttendance(x.attendance);}).catch(e=>toast.error(e.message));},[]);return <SiteShell>{progress===null?<Loader label="Loading your progress"/>:<ProgressDashboard progress={progress} attendance={attendance}/>}</SiteShell>}
