import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Providers } from './providers';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Doende Verde',
  description:
    'Comunidade canábica brasileira — compartilhe experiências, aprenda e interaja sem censura.',
  keywords: ['cannabis', 'comunidade', 'brasil', 'doende verde', 'cultivo'],
  icons: {
    icon: '/favicon.ico'
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return (
    <html lang="pt-BR">
      <body>
        <Providers initialSession={session}>{children}</Providers>
        <AnalyticsProvider />
      </body>
    </html>
  );
}
