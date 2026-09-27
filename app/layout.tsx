import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '@/app/globals.css';

export const metadata: Metadata = { 
  title: 'RallyPoint Badminton Academy', 
  description: 'Book courts, train with expert coaches, and track your badminton progress.' 
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { 
  return (
    <html lang="en">
      <body className="bg-transparent">
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            style: { borderRadius: '10px', background: '#1A1A1A', color: '#fff' }, 
            success: { iconTheme: { primary: '#FFC107', secondary: '#1A1A1A' } } 
          }} 
        />
        {children}
      </body>
    </html>
  ); 
}