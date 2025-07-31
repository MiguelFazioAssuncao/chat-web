import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextProp {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProp>({
    isAuthenticated: false,
    login: () => {},
    logout: () => {}
});

export const AuthProvider = ({children}: any) => {
    const [isAuthenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        setAuthenticated(!!token);
    });

    const login = (token: string) => {
        setAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => useContext(AuthContext);