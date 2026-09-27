'use client';
import Link from 'next/link';
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/utils/helpers';
import type { Settings } from '@/lib/types/database';

export function Footer() {
  const [settings, setSettings] = useState<Settings|null>(null);

  useEffect(() => {
    api<{ settings: Settings }>('/api/settings')
      .then(x => setSettings(x.settings))
      .catch(() => {});
  }, []);

  const social = settings?.social_links || {};

  return (
    <footer className="bg-ink py-12 text-white">
      <div className="container-page grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-xl font-extrabold">{settings?.academy_name || 'RallyPoint Badminton Academy'}</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            {settings?.description || 'A focused, welcoming home for players who want to keep getting better.'}
          </p>
        </div>

        <div>
          <h4 className="font-bold">Explore</h4>
          <div className="mt-3 grid gap-2 text-sm text-stone-300">
            {[
              ['Book a court', '/book'],
              ['Programs', '/programs'],
              ['Coaches', '/coaches'],
              ['Gallery', '/gallery']
            ].map(([l, h]) => (
              <Link key={h} href={h} className="hover:text-brand">
                {l}
              </Link>
            ))}
            
            {/* Direct Link to Admin Login Panel */}
            <div className="pt-2">
              <Link
                href="/login?redirect=/admin"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-brand transition hover:bg-white/20"
              >
                <Lock size={12} />
                <span>Admin Portal</span>
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold">Contact</h4>
          <div className="mt-3 grid gap-2 text-sm text-stone-300">
            <span className="flex gap-2">
              <MapPin size={16} className="shrink-0 text-brand" />
              {settings?.address || 'Ahmedabad, Gujarat'}
            </span>
            <a href={`tel:${settings?.phone || ''}`} className="flex gap-2 hover:text-brand">
              <Phone size={16} className="text-brand" />
              {settings?.phone || 'Contact us'}
            </a>
            <a href={`mailto:${settings?.email || ''}`} className="flex gap-2 hover:text-brand">
              <Mail size={16} className="text-brand" />
              {settings?.email || 'Email us'}
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold">Follow</h4>
          <div className="mt-3 flex gap-3">
            {[
              [Instagram, social.instagram],
              [Facebook, social.facebook],
              [Youtube, social.youtube]
            ].map(([Icon, url], i) =>
              url ? (
                <a key={i} href={String(url)} target="_blank" rel="noreferrer" className="rounded-lg bg-white/10 p-2 text-brand hover:bg-white/20">
                  {typeof Icon === 'function' && <Icon size={18} />}
                </a>
              ) : null
            )}
          </div>
        </div>
      </div>

      <div className="container-page mt-10 border-t border-white/15 pt-6 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {settings?.academy_name || 'RallyPoint Badminton Academy'}. All rights reserved.
      </div>
    </footer>
  );
}