import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = ['/profile', '/journal', '/library'];
  
  const token = request.cookies.get('token')?.value; // Assuming you might eventually switch to cookies, otherwise this is just a placeholder logic for now or we rely on client side strictly. 
  // However, since your current auth uses localStorage (client-side only), 
  // efficient server-side middleware protection is limited without moving token to cookies.
  // Ideally, you should refactor AuthContext to store token in cookies for this to work fully.
  
  // For now, let's implement a header-based check if you were to send it, 
  // or primarily use this file for other middleware tasks like security headers.
  
  // Example: redirect if accessing /profile without a specific cookie (if you had one)
  // if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route)) && !token) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
