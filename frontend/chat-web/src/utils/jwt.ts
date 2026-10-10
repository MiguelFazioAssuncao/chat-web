import { jwtDecode } from "jwt-decode";
export type JwtPayload = {
  sub: string;
  username?: string;
  exp?: number;
  [key: string]: unknown;
};
export function extractUserIdFromToken(token: string): string | null {
  try {
    return jwtDecode<JwtPayload>(token).sub || null;
  } catch {
    return null;
  }
}
export function isValidToken(token: string): boolean {
  try {
    const value = jwtDecode<JwtPayload>(token);
    return Boolean(value.sub && value.exp && value.exp * 1000 > Date.now());
  } catch {
    return false;
  }
}
