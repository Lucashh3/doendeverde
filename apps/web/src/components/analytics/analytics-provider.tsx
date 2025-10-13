'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

const PLAUSIBLE_DATA_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_API_HOST = process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST ?? 'https://plausible.io';

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
  }
}

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!PLAUSIBLE_DATA_DOMAIN || typeof window === 'undefined' || !window.plausible) {
      return;
    }

    window.plausible('pageview', {
      props: {
        url: `${pathname}${searchParams.size > 0 ? `?${searchParams.toString()}` : ''}`,
        referrer: document.referrer ?? undefined
      }
    });
  }, [pathname, searchParams]);

  if (!PLAUSIBLE_DATA_DOMAIN) {
    return null;
  }

  const scriptSrc = `${PLAUSIBLE_API_HOST.replace(/\/$/, '')}/js/script.tagged-events.js`;

  return (
    <Script
      defer
      data-domain={PLAUSIBLE_DATA_DOMAIN}
      src={scriptSrc}
      strategy="afterInteractive"
    />
  );
}
