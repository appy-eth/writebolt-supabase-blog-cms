import { createHash } from 'node:crypto';
import { adminPassword, adminUsername } from './env';
import { blogBasePath, publicPath } from './utils';

const COOKIE_NAME = 'wb_admin_session';

function hashToken(username: string, password: string): string {
  return createHash('sha256').update(`${username}:${password}:writebolt`).digest('hex');
}

export function getExpectedToken(): string {
  return hashToken(adminUsername(), adminPassword());
}

export function isAuthenticated(request: Request): boolean {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  return match[1] === getExpectedToken();
}

function cookiePath(): string {
  return blogBasePath() || '/';
}

export function loginResponse(redirect = '/admin'): Response {
  const token = getExpectedToken();
  const location = /^https?:/i.test(redirect) ? redirect : publicPath(redirect);
  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': `${COOKIE_NAME}=${token}; Path=${cookiePath()}; HttpOnly; SameSite=Lax; Max-Age=86400`,
      Location: location,
    },
  });
}

export function logoutResponse(): Response {
  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': `${COOKIE_NAME}=; Path=${cookiePath()}; HttpOnly; Max-Age=0`,
      Location: publicPath('/admin/login'),
    },
  });
}

export function requireAuth(request: Request): Response | null {
  if (!isAuthenticated(request)) {
    return new Response(null, { status: 302, headers: { Location: publicPath('/admin/login') } });
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
