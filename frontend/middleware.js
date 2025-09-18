import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT secret - should match your backend
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Protected routes that require authentication
const protectedRoutes = [
  '/',
  '/applications',
  '/portfolio',
  '/recruiter/dashboard',
  '/recruiter/profile',
  '/freelance'
];

// Auth routes that should redirect if already logged in
const authRoutes = ['/auth', '/auth/login', '/auth/signup'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  // Check if current route is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Verify JWT token
  let isAuthenticated = false;
  let user = null;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      isAuthenticated = true;
      user = decoded;
    } catch (error) {
      // Token is invalid or expired
      isAuthenticated = false;
    }
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Add user info to headers for use in getServerSideProps
  if (isAuthenticated) {
    const response = NextResponse.next();
    response.headers.set('x-user', JSON.stringify(user));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};


