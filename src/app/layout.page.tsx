import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../fonts.css';
import '../index.css';

export const metadata: Metadata = {
  title: 'BetterSanFernando — Next.js migration foundation',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
