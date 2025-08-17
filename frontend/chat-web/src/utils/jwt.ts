

export type JwtPayload = {
  sub: string;
  username?: string;
  exp?: number;
  [key: string]: any;
};

export function extractUserIdFromToken(token: string): string | null {
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.sub ?? null;
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

import { jwtDecode } from "jwt-decode";
