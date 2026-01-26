import { NextResponse } from 'next/server';

export async function middleware(request) {
    const session = request.cookies.get('session');

    // Return to / if user is already logged in and trying to access login page
    if (session && request.nextUrl.pathname.startsWith('/authentication')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect to login if user is not logged in and trying to access protected route
    if (!session && !request.nextUrl.pathname.startsWith('/authentication')) {
        return NextResponse.redirect(new URL('/authentication/login/minimal', request.url));
    }

    // Role-based access control is handled in components
    // Middleware only checks for session existence

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
         * - images (public images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
};
