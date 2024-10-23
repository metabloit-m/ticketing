import axios from 'axios';
import { NextResponse, type NextRequest } from 'next/server';
import buildClient from './lib/build-client';

export default async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  console.log(requestHeaders);

  const {
    data: { currentUser },
  } = await buildClient(Object.fromEntries(requestHeaders)).get(
    '/api/users/currentuser'
  );

  if (currentUser)
    requestHeaders.set('currentUser', JSON.stringify(currentUser));

  console.log(currentUser);
  console.log(request.url);

  // if(currentUser && request.nextUrl.pathname !== '/'){
  //   return Response.redirect(new URL('/', request.url))
  // }
  //
  if (
    currentUser &&
    (request.nextUrl.pathname.startsWith('/signin') ||
      request.nextUrl.pathname.startsWith('/signup'))
  ) {
    return Response.redirect(new URL('/', request.url));
  }

  if (!currentUser && request.nextUrl.pathname.startsWith('/tickets')) {
    return Response.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
    '/signup',
    '/signin',
  ],
};
