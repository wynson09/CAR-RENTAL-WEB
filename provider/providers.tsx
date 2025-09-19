'use client';
import { useThemeStore } from '@/store';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';
import { Toaster as ReactToaster } from '@/components/ui/toaster';
import { Toaster } from 'react-hot-toast';
import { SonnToaster } from '@/components/ui/sonner';
import { usePathname } from 'next/navigation';
const Providers = ({ children }: { children: React.ReactNode }) => {
  const { theme, radius } = useThemeStore();
  usePathname(); // keep subscription if needed

  return (
    <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
      <div
        className={cn('h-full', 'theme-' + theme)}
        style={{ '--radius': `${radius}rem` } as React.CSSProperties}
      >
        {children}
        <ReactToaster />
      </div>
      <Toaster />
      <SonnToaster />
    </ThemeProvider>
  );
};

export default Providers;
