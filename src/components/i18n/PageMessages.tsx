'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createPageT, type PageT } from '../../i18n/page-t';

const PageTContext = createContext<PageT>(createPageT({}));

/** Hands a server page's Filipino messages to its client components. */
export function PageMessages({
  messages,
  children,
}: {
  messages: Record<string, string>;
  children: ReactNode;
}) {
  const t = useMemo(() => createPageT(messages), [messages]);
  return <PageTContext.Provider value={t}>{children}</PageTContext.Provider>;
}

export const usePageT = () => useContext(PageTContext);
