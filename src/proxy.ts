import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-bsf-locale', 'fil');
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/fil/:path*'],
};
