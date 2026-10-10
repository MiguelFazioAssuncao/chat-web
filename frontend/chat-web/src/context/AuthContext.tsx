import { createContext, useContext, useEffect, useState } from "react";
import { isValidToken } from "../utils/jwt";

type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  loadingAuth: boolean;
  login: (token: string, rememberMe?: boolean) => void;
  logout: () => void;
};
// This module keeps the provider and its hook together.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  token: null,
  loadingAuth: false,
  login: () => {},
  logout: () => {},
});
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    const saved =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (saved && isValidToken(saved)) return saved;
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    return null;
  });
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
  };
  const login = (value: string, rememberMe = false) => {
    if (!isValidToken(value))
      throw new Error("A resposta de autenticação é inválida.");
    (rememberMe ? localStorage : sessionStorage).setItem("token", value);
    (rememberMe ? sessionStorage : localStorage).removeItem("token");
    setToken(value);
  };
  useEffect(() => {
    const syncToken = (event: StorageEvent) => {
      if (event.key !== "token") return;
      const saved =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      setToken(saved && isValidToken(saved) ? saved : null);
    };
    window.addEventListener("chatweb:session-expired", logout);
    window.addEventListener("storage", syncToken);
    if (!token)
      return () => {
        window.removeEventListener("chatweb:session-expired", logout);
        window.removeEventListener("storage", syncToken);
      };
    // Recheck periodically rather than relying on browser timeout limits.
    const timer = window.setInterval(() => {
      if (!isValidToken(token)) logout();
    }, 30000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("chatweb:session-expired", logout);
      window.removeEventListener("storage", syncToken);
    };
  }, [token]);
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(token),
        token,
        loadingAuth: false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
