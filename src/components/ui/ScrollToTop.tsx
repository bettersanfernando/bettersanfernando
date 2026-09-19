'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Next.js port of ScrollToTop.tsx. next/navigation has no hash-tracking
// hook (usePathname() only returns the path), so the hash is read directly
// from window.location on each pathname change instead of from a router
// state field. Behavior is otherwise identical to the react-router version.
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
