import { NextRequest, NextResponse } from 'next/server';
import { FILIPINO_PREFIX } from './i18n/locale';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale =
    pathname === FILIPINO_PREFIX || pathname.startsWith(`${FILIPINO_PREFIX}/`)
      ? 'fil'
      : 'en';
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-bsf-locale', locale);

  if (locale === 'en') {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname.slice(FILIPINO_PREFIX.length) || '/';
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next|api|assets|favicon.ico|robots.txt|sitemap.xml).*)'],
};
