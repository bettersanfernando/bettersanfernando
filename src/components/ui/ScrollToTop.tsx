'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// usePathname() does not include the hash, so it is read from window.location
// on each pathname change.
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const targetId = decodeURIComponent(hash.slice(1));
    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
      target?.scrollIntoView();
      return Boolean(target);
    };

    if (scrollToTarget()) return;

    const observer = new MutationObserver(() => {
      if (scrollToTarget()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
