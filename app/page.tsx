import { SiteShell } from '@/components/layout/SiteShell';
import { HomePage } from '@/components/home/HomePage';

export default function Page() {
  return (
    <SiteShell>
      {/* Dynamic Style Override to make homepage containers transparent */}
      <style dangerouslySetInnerHTML={{ __html: `
        main, 
        main .bg-stone-50, 
        main .bg-white, 
        div[class*="bg-stone-50"], 
        div[class*="bg-white"] {
          background-color: transparent !important;
        }
        /* Keep cards and forms glassmorphic/readable */
        .card, 
        main .card, 
        div[class*="shadow-card"] {
          background-color: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(4px) !important;
        }
      `}} />
      
      <HomePage />
    </SiteShell>
  );
}