import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Brand from "../ui/Brand";
import BackgroundBlue from "./BackgroundBlue";
import AuthForm from "./AuthForm";
import type { AuthMode } from "./AuthForm";
export default function AuthLayout({ mode }: { mode: AuthMode }) {
  return (
    <main className="auth-page">
      <section className="auth-main">
        <header className="auth-header">
          <Brand />
          <Link to="/" className="back-link">
            <FiArrowLeft /> Voltar ao início
          </Link>
        </header>
        <AuthForm mode={mode} />
        <footer className="auth-footer">
          Feito para conectar pessoas.{" "}
          <span>© {new Date().getFullYear()} ChatWeb</span>
        </footer>
      </section>
      <BackgroundBlue />
    </main>
  );
}
