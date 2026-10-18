import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-me-please-32chars"
);

export const AUTH_COOKIE = "gm_session";

export type SessionPayload = {
  sub: string;
  email: string;
  role: "SUPER_ADMIN" | "REGIONAL_OVERSEER" | "ORG_ADMIN" | "MEMBER_VIEWER";
  orgId?: string | null;
  assignedRegion?: string | null;
};

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export function requireRole(session: SessionPayload | null, roles: SessionPayload["role"][]): boolean {
  if (!session) return false;
  return roles.includes(session.role);
}
