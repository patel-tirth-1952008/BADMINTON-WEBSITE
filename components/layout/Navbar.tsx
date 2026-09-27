'use client';
import Link from 'next/link';
import { Menu, Trophy, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MobileMenu } from './MobileMenu';
import { useAuth } from '@/lib/hooks/useAuth';
import { api } from '@/lib/utils/helpers';
import toast from 'react-hot-toast';

const nav = [
  ['Programs', '/programs'],
  ['Coaches', '/coaches'],
  ['Facilities', '/facilities'],
  ['Gallery', '/gallery'],
  ['Contact', '/contact']
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('RallyPoint');
  const { profile } = useAuth();

  useEffect(() => {
    api<{ settings: { academy_name: string } }>('/api/settings')
      .then(({ settings }) => setName(settings.academy_name))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out successfully');
        // Clear cookies and session fully by routing to login
        window.location.href = '/login';
      } else {
        toast.error('Failed to log out');
      }
    } catch {
      toast.error('An error occurred during logout');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link className="flex items-center gap-2 font-extrabold tracking-tight" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand">
            <Trophy size={19} />
          </span>
          <span className="hidden sm:inline">{name}</span>
          <span className="sm:hidden">Rally<span className="text-amber-700">Point</span></span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="text-sm font-semibold text-stone-700 transition hover:text-amber-700">
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {profile ? (
            <>
              {profile.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="font-bold text-amber-700 hover:bg-amber-50">
                    Admin
                  </Button>
                </Link>
              )}
              <Link href="/progress">
                <Button variant="ghost" size="sm">My Progress</Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5"
              >
                <LogOut size={14} />
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
          )}
          <Link href="/book">
            <Button size="sm">Book Now</Button>
          </Link>
        </div>

        <button className="rounded-lg p-2 hover:bg-stone-100 md:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
          <Menu />
        </button>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} isLoggedIn={!!profile} />
    </header>
  );
}