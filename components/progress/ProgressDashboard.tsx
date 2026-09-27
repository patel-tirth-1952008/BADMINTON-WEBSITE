'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { AttendanceEntry, ProgressEntry } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { SKILLS } from '@/lib/utils/constants';
import { SkillRadarChart } from './SkillRadarChart';
import { AttendanceTracker } from './AttendanceTracker';
import { SessionHistory } from './SessionHistory';
import { ProgressTimeline } from './ProgressTimeline';

export function ProgressDashboard({ progress, attendance }: { progress: ProgressEntry[]; attendance: AttendanceEntry[] }) {
  const latest = progress[0];
  const previous = progress[1];
  const delta = latest && previous ? Number((latest.overall_rating - previous.overall_rating).toFixed(1)) : 0;

  return (
    <div className="container-page section">
      <div>
        <p className="text-sm font-bold uppercase tracking-[.14em] text-amber-700">My training data</p>
        <h1 className="mt-2 text-4xl font-extrabold">Progress dashboard</h1>
        <p className="mt-2 text-muted">Feedback and attendance recorded by your coaching team.</p>
      </div>
      {!latest ? (
        <Card className="mt-8 p-10 text-center">
          <h2 className="text-xl font-extrabold">Your progress story starts here</h2>
          <p className="mt-2 text-muted">Your coach will add a skill assessment after your first tracked session.</p>
        </Card>
      ) : (
        <>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-muted">Current overall rating</p>
              <p className="mt-2 text-5xl font-extrabold">{latest.overall_rating}<span className="text-xl text-muted">/10</span></p>
              {previous && <p className={`mt-3 flex items-center gap-1 text-sm font-bold ${delta >= 0 ? 'text-success' : 'text-danger'}`}>
                {delta >= 0 ? <TrendingUp size={17} /> : <TrendingDown size={17} />} {Math.abs(delta)} since previous review
              </p>}
            </Card>
            <Card className="p-5 md:col-span-2">
              <p className="text-sm font-semibold text-muted">Current strengths</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {SKILLS.map(([key, label]) => <div key={key}>
                  <div className="mb-1 flex justify-between text-xs"><span>{label}</span><strong>{latest[key]}/10</strong></div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-brand" style={{ width: `${Number(latest[key]) * 10}%` }} /></div>
                </div>)}
              </div>
            </Card>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-6"><h2 className="text-xl font-extrabold">Skill profile</h2><SkillRadarChart entry={latest} /></Card>
            <Card className="p-6"><h2 className="text-xl font-extrabold">Attendance</h2><div className="mt-5"><AttendanceTracker attendance={attendance} /></div></Card>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="p-6"><h2 className="text-xl font-extrabold">Coach timeline</h2><div className="mt-6"><ProgressTimeline entries={progress} /></div></Card>
            <Card className="p-6"><h2 className="text-xl font-extrabold">Session history</h2><div className="mt-5"><SessionHistory entries={progress} /></div></Card>
          </div>
        </>
      )}
    </div>
  );
}
