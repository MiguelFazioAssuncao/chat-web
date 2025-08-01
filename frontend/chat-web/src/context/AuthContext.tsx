import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProp {
  isAuthenticated: boolean;
  token: string | null;
  loadingAuth: boolean;
  login: (token: string, rememberMe?: boolean) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProp>({
  isAuthenticated: false,
  token: null,
  loadingAuth: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const savedToken =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      setAuthenticated(true);
    }
    setLoadingAuth(false);
  }, []);

  const login = (newToken: string, rememberMe: boolean = false) => {
    if (rememberMe) {
      localStorage.setItem("token", newToken);
      sessionStorage.removeItem("token");
    } else {
      sessionStorage.setItem("token", newToken);
      localStorage.removeItem("token");
    }
    setToken(newToken);
    setAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    setAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, loadingAuth, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
