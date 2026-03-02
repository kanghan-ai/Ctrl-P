import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    // 游客模式: 允许所有人访问 dashboard
    // 不再强制要求登录

    // 检查 Supabase session cookies
    const cookies = request.cookies;
    const hasSupabaseSession =
        cookies.has('sb-access-token') ||
        cookies.has('sb-refresh-token') ||
        // 新版 Supabase 可能使用这些 cookie 名称
        Array.from(cookies.getAll()).some(cookie =>
            cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
        );

    // If accessing login/signup while logged in, redirect to dashboard
    if (hasSupabaseSession && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
