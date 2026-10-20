import { createHmac } from 'crypto';

const SECRET      = process.env.NEXTAUTH_SECRET || 'qkit-secret-change-in-prod';
export const COOKIE_NAME    = 'qkit_session';
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export interface SessionPayload {
  userId: string;
  phone:  string;
  name?:  string;
  iat:    number;
  exp:    number;
}

/** Sign and encode a session token (no external deps — uses Node crypto) */
export function createSessionToken(
  payload: Omit<SessionPayload, 'iat' | 'exp'>
): string {
  const now  = Math.floor(Date.now() / 1000);
  const full: SessionPayload = { ...payload, iat: now, exp: now + COOKIE_MAX_AGE };
  const data = Buffer.from(JSON.stringify(full)).toString('base64url');
  const sig  = createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

/** Verify and decode a session token — returns null if invalid / expired */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;
    const data = token.slice(0, dot);
    const sig  = token.slice(dot + 1);
    const expected = createHmac('sha256', SECRET).update(data).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf-8')
    ) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
