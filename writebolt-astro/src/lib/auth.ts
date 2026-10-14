import { createHash } from 'node:crypto';

const COOKIE_NAME = 'wb_admin_session';

function hashToken(username: string, password: string): string {
  return createHash('sha256').update(`${username}:${password}:writebolt`).digest('hex');
}

export function getExpectedToken(): string {
  const u = process.env.ADMIN_USERNAME || 'admin';
  const p = process.env.ADMIN_PASSWORD || 'changeme';
  return hashToken(u, p);
}

export function isAuthenticated(request: Request): boolean {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  return match[1] === getExpectedToken();
}

export function loginResponse(redirect = '/admin'): Response {
  const token = getExpectedToken();
  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      Location: redirect,
    },
  });
}

export function logoutResponse(): Response {
  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`,
      Location: '/admin/login',
    },
  });
}

export function requireAuth(request: Request): Response | null {
  if (!isAuthenticated(request)) {
    return new Response(null, { status: 302, headers: { Location: '/admin/login' } });
  }
  return null;
}

export function requireApiAuth(request: Request): Response | null {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
