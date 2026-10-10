import { Link } from "react-router-dom";
import { FiArrowUpRight, FiMoon, FiSun } from "react-icons/fi";
import Brand from "../ui/Brand";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";
export default function Header() {
  const { demo, connection } = useChat();
  const { dark, toggle } = useTheme();
  return (
    <header className="workspace-header">
      <Brand />
      <span className="workspace-header-label">Seu ponto de encontro.</span>
      <div className="workspace-header-right">
        {demo ? (
          <>
            <span className="demo-label">Demonstração</span>
            <Link className="text-link" to="/auth/register">
              Criar conta <FiArrowUpRight />
            </Link>
          </>
        ) : (
          <span className={`connection ${connection}`} role="status">
            <i />
            {connection === "connected"
              ? "Conectado"
              : connection === "connecting"
                ? "Conectando…"
                : "Reconectando…"}
          </span>
        )}
        <button
          className="icon-button"
          onClick={toggle}
          aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
        >
          {dark ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </header>
  );
}
