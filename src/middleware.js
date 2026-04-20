import { NextResponse } from 'next/server';

function isPublicPath(pathname) {
    // Public pages (boleh diakses tanpa cookie session)
    if (pathname === '/') return true;

    // Public catalog
    if (pathname === '/services' || pathname.startsWith('/services/')) return true;
    if (pathname === '/products' || pathname.startsWith('/products/')) return true;

    // Public payment status/process pages (butuh redirectUrl/orderId dari gateway)
    if (pathname.startsWith('/payments/')) return true;

    // Public verify/maintenance/404 pages inside authentication group already handled by prefix,
    // but keep this list focused on non-/authentication public routes.
    return false;
}

export async function middleware(request) {
    const session = request.cookies.get('session');
    const pathname = request.nextUrl.pathname;

    // Return to / if user is already logged in and trying to access login page
    if (session && pathname.startsWith('/authentication')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Redirect ke login dengan ?redirect=... supaya query (mis. orderId Doku) tidak hilang
    if (!session && !pathname.startsWith('/authentication') && !isPublicPath(pathname)) {
        const login = new URL('/authentication/login/minimal', request.url);
        const back = `${pathname}${request.nextUrl.search}`;
        if (back && back !== '/') {
            login.searchParams.set('redirect', back);
        }
        return NextResponse.redirect(login);
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
         *
         * Catatan: entri '/' eksplisit supaya root selalu lewat middleware
         * (beberapa versi/setup regex di atas tidak menangkap pathname '/')
         */
        '/',
        '/((?!api|_next/static|_next/image|favicon.ico|images|assets|eduvalt-assets).*)',
    ],
};
