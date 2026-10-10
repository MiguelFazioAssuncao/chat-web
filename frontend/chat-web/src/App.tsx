import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import PrivateRoute from "./routes/PrivateRoute";
import ResetPasswordRoute from "./routes/ResetPasswordRoute";
import Brand from "./components/ui/Brand";
const Landing = lazy(() => import("./pages/public/Landing"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const AppLayout = lazy(() => import("./pages/app/AppLayout"));
function PageEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const titles: Record<string, string> = {
      "/": "Menos distância. Mais conversa.",
      "/auth/login": "Entre na sua conta",
      "/auth/register": "Crie sua conta",
      "/auth/forgot-password": "Recupere sua senha",
      "/auth/reset-password": "Nova senha",
      "/app": "Suas conversas",
      "/demo": "Experimente o ChatWeb",
    };
    document.title = `${titles[pathname] || "Página não encontrada"} · ChatWeb`;
  }, [pathname]);
  return null;
}
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <PageEffects />
          <Suspense
            fallback={
              <div className="page-loading" role="status">
                <Brand />
                <span className="spinner" />
                <p>Preparando seu espaço…</p>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/login" element={<Login />} />
              <Route
                path="/auth/forgot-password"
                element={<ForgotPassword />}
              />
              <Route element={<ResetPasswordRoute />}>
                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />
              </Route>
              <Route element={<PrivateRoute />}>
                <Route path="/app" element={<AppLayout />} />
              </Route>
              <Route path="/demo" element={<AppLayout demo />} />
              <Route
                path="/auth"
                element={<Navigate to="/auth/login" replace />}
              />
              <Route
                path="*"
                element={
                  <main className="not-found">
                    <Brand />
                    <span className="eyebrow">404 · OPA, CADÊ A CONVERSA?</span>
                    <h1>Este caminho não existe.</h1>
                    <p className="muted">Mas seu próximo olá está bem aqui.</p>
                    <Link className="button button-primary" to="/">
                      Voltar ao início →
                    </Link>
                  </main>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
