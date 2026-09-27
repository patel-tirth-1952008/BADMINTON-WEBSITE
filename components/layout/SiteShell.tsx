'use client';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { api } from '@/lib/utils/helpers';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    api<{ settings: { whatsapp_number?: string } }>('/api/settings')
      .then(x => setWhatsapp(x.settings.whatsapp_number || ''))
      .catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main>{children}</main>
      {whatsapp && (
        <a
          aria-label="Chat on WhatsApp"
          href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-5 right-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-success text-white shadow-lg transition hover:scale-105"
        >
          <MessageCircle />
        </a>
      )}
      <Footer />
    </>
  );
}